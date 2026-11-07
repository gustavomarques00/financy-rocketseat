import type { PrismaClient, User } from '../lib/prisma.js'
import { hashPassword, verifyPassword } from '../auth/password.js'
import { signAccessToken } from '../auth/jwt.js'
import type { Env } from '../env.js'
import { AppError } from '../errors.js'
import {
  formatZodError,
  loginInputSchema,
  normalizeEmail,
  registerInputSchema,
  updateMeInputSchema,
} from '../validation/inputs.js'
import { issueRefreshSession } from './sessions.js'

export type PublicUser = {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export type AuthResult = {
  token: string
  user: PublicUser
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

async function issueAccessToken(
  env: Env,
  user: Pick<User, 'id' | 'sessionVersion'>,
  rememberMe: boolean,
): Promise<string> {
  const expiresIn = rememberMe ? env.JWT_EXPIRES_IN : env.JWT_EXPIRES_IN_SESSION
  return signAccessToken(user.id, user.sessionVersion, env.JWT_SECRET, expiresIn)
}

export async function registerUser(
  prisma: PrismaClient,
  env: Env,
  rawInput: unknown,
): Promise<AuthResult> {
  const parsed = registerInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    throw new AppError(formatZodError(parsed.error), 'BAD_USER_INPUT', 400)
  }

  const email = normalizeEmail(parsed.data.email)
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new AppError('Email is already registered.', 'CONFLICT', 409)
  }

  const passwordHash = await hashPassword(parsed.data.password)
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
    },
  })

  const rememberMe = parsed.data.rememberMe === true
  if (rememberMe) {
    await issueRefreshSession(prisma, env, user.id)
  }

  const token = await issueAccessToken(env, user, rememberMe)
  return { token, user: toPublicUser(user) }
}

export async function loginUser(
  prisma: PrismaClient,
  env: Env,
  rawInput: unknown,
): Promise<AuthResult> {
  const parsed = loginInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    throw new AppError(formatZodError(parsed.error), 'BAD_USER_INPUT', 400)
  }

  const email = normalizeEmail(parsed.data.email)
  const user = await prisma.user.findUnique({ where: { email } })

  const invalidCredentials = new AppError('Invalid email or password.', 'UNAUTHENTICATED', 401)

  if (!user) {
    throw invalidCredentials
  }

  const matches = await verifyPassword(parsed.data.password, user.passwordHash)
  if (!matches) {
    throw invalidCredentials
  }

  const rememberMe = parsed.data.rememberMe === true
  if (rememberMe) {
    await issueRefreshSession(prisma, env, user.id)
  }

  const token = await issueAccessToken(env, user, rememberMe)
  return { token, user: toPublicUser(user) }
}

export async function updateOwnName(
  prisma: PrismaClient,
  userId: string,
  rawInput: unknown,
): Promise<PublicUser> {
  const parsed = updateMeInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    throw new AppError(formatZodError(parsed.error), 'BAD_USER_INPUT', 400)
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } })
  if (!existing) {
    throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401)
  }

  const user = await prisma.user.update({
    where: { id: existing.id },
    data: { name: parsed.data.name },
  })

  return toPublicUser(user)
}

export async function getAuthenticatedUser(
  prisma: PrismaClient,
  userId: string,
): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401)
  }

  return toPublicUser(user)
}
