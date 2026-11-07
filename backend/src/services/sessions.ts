import type { PrismaClient } from '../lib/prisma.js'
import { buildRefreshCookie, parseCookies, REFRESH_COOKIE_NAME } from '../auth/cookies.js'
import { signAccessToken } from '../auth/jwt.js'
import { generateOpaqueToken, hashToken } from '../auth/tokens.js'
import type { Env } from '../env.js'
import { AppError } from '../errors.js'
import { getRequestContext, queueSetCookie } from '../http/requestContext.js'

function refreshTtlMs(env: Env): number {
  return env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
}

function refreshMaxAgeSeconds(env: Env): number {
  return env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60
}

export function readRefreshTokenFromCookieHeader(cookieHeader: string | null): string | null {
  const cookies = parseCookies(cookieHeader)
  return cookies[REFRESH_COOKIE_NAME] ?? null
}

export async function issueRefreshSession(
  prisma: PrismaClient,
  env: Env,
  userId: string,
): Promise<void> {
  const rawToken = generateOpaqueToken()
  const tokenHash = hashToken(rawToken)
  const ctx = getRequestContext()
  const expiresAt = new Date(Date.now() + refreshTtlMs(env))

  await prisma.refreshSession.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      userAgent: ctx?.userAgent?.slice(0, 255) ?? null,
    },
  })

  queueSetCookie(
    buildRefreshCookie(env, rawToken, { maxAgeSeconds: refreshMaxAgeSeconds(env) }, ctx?.requestUrl),
  )
}

export async function clearRefreshCookie(env: Env): Promise<void> {
  const ctx = getRequestContext()
  queueSetCookie(
    buildRefreshCookie(env, null, { maxAgeSeconds: 0, clear: true }, ctx?.requestUrl),
  )
}

export async function revokeAllRefreshSessions(
  prisma: PrismaClient,
  userId: string,
): Promise<void> {
  await prisma.refreshSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

/**
 * Rotate refresh token. Reuse of a revoked token revokes all sessions for that user.
 */
export async function rotateRefreshSession(
  prisma: PrismaClient,
  env: Env,
  rawRefreshToken: string,
): Promise<{ accessToken: string }> {
  const tokenHash = hashToken(rawRefreshToken)
  const existing = await prisma.refreshSession.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, sessionVersion: true } } },
  })

  if (!existing) {
    throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401)
  }

  if (existing.revokedAt) {
    await revokeAllRefreshSessions(prisma, existing.userId)
    await clearRefreshCookie(env)
    throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401)
  }

  if (existing.expiresAt.getTime() <= Date.now()) {
    await prisma.refreshSession.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    })
    await clearRefreshCookie(env)
    throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401)
  }

  const nextRaw = generateOpaqueToken()
  const nextHash = hashToken(nextRaw)
  const expiresAt = new Date(Date.now() + refreshTtlMs(env))
  const ctx = getRequestContext()

  let createdId: string
  try {
    createdId = await prisma.$transaction(async (tx) => {
      const consumed = await tx.refreshSession.updateMany({
        where: { id: existing.id, revokedAt: null },
        data: { revokedAt: new Date(), lastUsedAt: new Date() },
      })

      if (consumed.count !== 1) {
        throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401)
      }

      const created = await tx.refreshSession.create({
        data: {
          userId: existing.userId,
          tokenHash: nextHash,
          expiresAt,
          userAgent: ctx?.userAgent?.slice(0, 255) ?? existing.userAgent,
        },
      })

      await tx.refreshSession.update({
        where: { id: existing.id },
        data: { replacedById: created.id },
      })

      return created.id
    })
  } catch (error) {
    if (error instanceof AppError) {
      await revokeAllRefreshSessions(prisma, existing.userId)
      await clearRefreshCookie(env)
      throw error
    }
    throw error
  }

  void createdId

  queueSetCookie(
    buildRefreshCookie(env, nextRaw, { maxAgeSeconds: refreshMaxAgeSeconds(env) }, ctx?.requestUrl),
  )

  const accessToken = await signAccessToken(
    existing.user.id,
    existing.user.sessionVersion,
    env.JWT_SECRET,
    env.JWT_EXPIRES_IN,
  )

  return { accessToken }
}

export async function logoutRefreshSession(
  prisma: PrismaClient,
  env: Env,
  cookieHeader: string | null,
): Promise<void> {
  const raw = readRefreshTokenFromCookieHeader(cookieHeader)
  if (raw) {
    const tokenHash = hashToken(raw)
    await prisma.refreshSession.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }
  await clearRefreshCookie(env)
}
