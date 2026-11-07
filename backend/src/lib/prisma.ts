import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../generated/prisma/client.js'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

export function createPrismaClient(databaseUrl = process.env.DATABASE_URL): PrismaClient {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to create Prisma Client')
  }

  const adapter = new PrismaBetterSqlite3({ url: databaseUrl })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export { PrismaClient, Prisma } from '../generated/prisma/client.js'
export type {
  User,
  Category,
  Transaction,
  PasswordResetToken,
  RefreshSession,
} from '../generated/prisma/client.js'
