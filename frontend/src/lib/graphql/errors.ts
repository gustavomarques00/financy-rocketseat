import { ClientError } from 'graphql-request'
import type { GraphQLErrorShape } from './types'

export class ApiError extends Error {
  readonly code: string

  constructor(message: string, code = 'UNKNOWN') {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

export function getErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado.'): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof ClientError) {
    const graphQLError = error.response.errors?.[0] as GraphQLErrorShape | undefined
    return graphQLError?.message ?? fallback
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof ApiError) {
    return error.code
  }

  if (error instanceof ClientError) {
    const graphQLError = error.response.errors?.[0] as GraphQLErrorShape | undefined
    return graphQLError?.extensions?.code
  }

  return undefined
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof ClientError) {
    const graphQLError = error.response.errors?.[0] as GraphQLErrorShape | undefined
    return new ApiError(
      graphQLError?.message ?? 'Falha na requisição GraphQL.',
      graphQLError?.extensions?.code ?? 'GRAPHQL_ERROR',
    )
  }

  return new ApiError(getErrorMessage(error), 'UNKNOWN')
}
