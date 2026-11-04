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
