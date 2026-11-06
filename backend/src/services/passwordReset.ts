import type { PrismaClient } from '../lib/prisma.js'
import { MemoryRateLimiter } from '../auth/rateLimit.js'
import { hashPassword } from '../auth/password.js'
import { generateOpaqueToken, hashToken } from '../auth/tokens.js'
import type { Env } from '../env.js'
import { AppError } from '../errors.js'
import { getRequestContext } from '../http/requestContext.js'
import { sendPasswordResetEmail } from '../mail/passwordResetEmail.js'
import type { MailTransport } from '../mail/types.js'
import {
  formatZodError,
  normalizeEmail,
  requestPasswordResetInputSchema,
  resetPasswordInputSchema,
} from '../validation/inputs.js'
import { revokeAllRefreshSessions } from './sessions.js'

const GENERIC_REQUEST_MESSAGE =
  'If an account exists for this email, a reset link has been sent.'

const requestLimiter = new MemoryRateLimiter(5, 15 * 60 * 1000)
const resetLimiter = new MemoryRateLimiter(10, 15 * 60 * 1000)

export function resetPasswordRateLimitersForTests(): void {
  requestLimiter.reset()
  resetLimiter.reset()
}

function clientKey(suffix: string): string {
  const ip = getRequestContext()?.clientIp ?? 'unknown'
  return `${ip}:${suffix}`
}

export async function requestPasswordReset(
  prisma: PrismaClient,
  env: Env,
  mail: MailTransport,
  rawInput: unknown,
): Promise<{ message: string }> {
  const parsed = requestPasswordResetInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    throw new AppError(formatZodError(parsed.error), 'BAD_USER_INPUT', 400)
  }

  const email = normalizeEmail(parsed.data.email)
  const limit = requestLimiter.check(clientKey(`reset-request:${email}`))
  if (!limit.allowed) {
    throw new AppError('Too many requests. Try again later.', 'RATE_LIMITED', 429)
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { message: GENERIC_REQUEST_MESSAGE }
  }

  const rawToken = generateOpaqueToken()
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TTL_MINUTES * 60 * 1000)

  await prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.updateMany({
      where: { userId: user.id, consumedAt: null },
      data: { consumedAt: new Date() },
    })
    await tx.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    })
  })

  try {
    await sendPasswordResetEmail(mail, env, { to: user.email, resetToken: rawToken })
  } catch (error) {
    console.error('[mail] password reset delivery failed')
    void error
    throw new AppError('Unable to send reset email. Try again later.', 'INTERNAL', 500)
  }

  return { message: GENERIC_REQUEST_MESSAGE }
}

export async function resetPassword(
  prisma: PrismaClient,
  env: Env,
  rawInput: unknown,
): Promise<{ message: string }> {
  const parsed = resetPasswordInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    throw new AppError(formatZodError(parsed.error), 'BAD_USER_INPUT', 400)
  }

  const limit = resetLimiter.check(clientKey('reset-consume'))
  if (!limit.allowed) {
    throw new AppError('Too many requests. Try again later.', 'RATE_LIMITED', 429)
  }

  const tokenHash = hashToken(parsed.data.token)
  const passwordHash = await hashPassword(parsed.data.newPassword)

  await prisma.$transaction(async (tx) => {
    const record = await tx.passwordResetToken.findUnique({
      where: { tokenHash },
    })

    if (!record || record.consumedAt || record.expiresAt.getTime() <= Date.now()) {
      throw new AppError('Invalid or expired reset token.', 'BAD_USER_INPUT', 400)
    }

    const consumed = await tx.passwordResetToken.updateMany({
      where: { id: record.id, consumedAt: null },
      data: { consumedAt: new Date() },
    })

    if (consumed.count !== 1) {
      throw new AppError('Invalid or expired reset token.', 'BAD_USER_INPUT', 400)
    }

    await tx.passwordResetToken.updateMany({
      where: { userId: record.userId, consumedAt: null },
      data: { consumedAt: new Date() },
    })

    await tx.user.update({
      where: { id: record.userId },
      data: {
        passwordHash,
        sessionVersion: { increment: 1 },
      },
    })

    await tx.refreshSession.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  })

  return { message: 'Password updated successfully.' }
}

export async function bumpSessionVersionAndRevoke(
  prisma: PrismaClient,
  userId: string,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { sessionVersion: { increment: 1 } },
  })
  await revokeAllRefreshSessions(prisma, userId)
}
