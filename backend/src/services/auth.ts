import type { PrismaClient, User } from '@prisma/client'
import { hashPassword, verifyPassword } from '../auth/password.js'
import { signAccessToken } from '../auth/jwt.js'
import type { Env } from '../env.js'
import { AppError } from '../errors.js'
import {
  formatZodError,
  loginInputSchema,
  normalizeEmail,
  registerInputSchema,
} from '../validation/inputs.js'

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

  const token = await signAccessToken(user.id, env.JWT_SECRET, env.JWT_EXPIRES_IN)
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

  const token = await signAccessToken(user.id, env.JWT_SECRET, env.JWT_EXPIRES_IN)
  return { token, user: toPublicUser(user) }
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
