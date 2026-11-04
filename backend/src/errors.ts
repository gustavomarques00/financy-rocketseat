import { GraphQLError } from 'graphql'
import { Prisma } from '@prisma/client'

export class AppError extends Error {
  readonly code: string
  readonly statusCode: number

  constructor(message: string, code = 'APP_ERROR', statusCode = 400) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
  }
}

export function toGraphQLErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected server error'
}

export function throwGraphQLError(
  message: string,
  code: string,
  statusCode = 400,
): never {
  throw new GraphQLError(message, {
    extensions: {
      code,
      http: { status: statusCode },
    },
  })
}

export function mapDomainError(error: unknown): never {
  if (error instanceof GraphQLError) {
    throw error
  }

  if (error instanceof AppError) {
    throwGraphQLError(error.message, error.code, error.statusCode)
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throwGraphQLError('A record with this unique value already exists.', 'CONFLICT', 409)
    }

    if (error.code === 'P2025') {
      throwGraphQLError('Resource not found.', 'NOT_FOUND', 404)
    }
  }

  console.error('[graphql] unexpected error:', error instanceof Error ? error.message : error)
  throwGraphQLError('Unexpected server error', 'INTERNAL_SERVER_ERROR', 500)
}

export function requireAuth(userId: string | null | undefined): string {
  if (!userId) {
    throwGraphQLError('Authentication required.', 'UNAUTHENTICATED', 401)
  }

  return userId
}
