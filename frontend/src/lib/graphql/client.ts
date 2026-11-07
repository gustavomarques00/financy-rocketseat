import { ClientError, GraphQLClient } from 'graphql-request'
import { getSessionBridge } from '../../auth/sessionBridge'
import { getBackendUrl } from '../env'
import { toApiError } from './errors'
import {
  CATEGORIES_QUERY,
  CREATE_CATEGORY_MUTATION,
  CREATE_TRANSACTION_MUTATION,
  DELETE_CATEGORY_MUTATION,
  DELETE_TRANSACTION_MUTATION,
  LOGIN_MUTATION,
  ME_QUERY,
  REGISTER_MUTATION,
  REQUEST_PASSWORD_RESET_MUTATION,
  RESET_PASSWORD_MUTATION,
  UPDATE_ME_MUTATION,
  TRANSACTIONS_QUERY,
  UPDATE_CATEGORY_MUTATION,
  UPDATE_TRANSACTION_MUTATION,
} from './operations'
import type {
  AuthPayload,
  Category,
  Transaction,
  TransactionType,
  User,
} from './types'

export function createGraphqlClient(token?: string | null): GraphQLClient {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return new GraphQLClient(getBackendUrl(), {
    headers,
    credentials: 'include',
  })
}

function isGraphqlUnauthenticated(error: unknown): boolean {
  if (!(error instanceof ClientError)) {
    return false
  }
  const code = error.response.errors?.[0]?.extensions?.code
  return code === 'UNAUTHENTICATED'
}

async function requestOnce<T>(
  token: string | null | undefined,
  document: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  return createGraphqlClient(token).request<T>(document, variables)
}

/**
 * Public / unauthenticated GraphQL operations — never refresh or retry.
 */
async function publicRequest<T>(
  document: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  try {
    return await requestOnce<T>(null, document, variables)
  } catch (error) {
    throw toApiError(error)
  }
}

/**
 * Authenticated GraphQL operations.
 *
 * On a GraphQL `UNAUTHENTICATED` response (resolver rejected before side effects),
 * coordinates a single refresh and retries the same operation once.
 * Network / 5xx / non-auth GraphQL errors are never retried.
 */
async function authenticatedRequest<T>(
  token: string,
  document: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  try {
    return await requestOnce<T>(token, document, variables)
  } catch (error) {
    if (!isGraphqlUnauthenticated(error)) {
      throw toApiError(error)
    }

    const bridge = getSessionBridge()
    if (!bridge || bridge.isRestoreSuppressed()) {
      bridge?.onSessionInvalid()
      throw toApiError(error)
    }

    const generation = bridge.getSessionGeneration()
    const refreshed = await bridge.refreshAccessToken()

    if (
      !refreshed ||
      bridge.getSessionGeneration() !== generation ||
      bridge.isRestoreSuppressed()
    ) {
      bridge.onSessionInvalid()
      throw toApiError(error)
    }

    bridge.onAccessToken(refreshed)

    try {
      return await requestOnce<T>(refreshed, document, variables)
    } catch (retryError) {
      if (isGraphqlUnauthenticated(retryError)) {
        bridge.onSessionInvalid()
      }
      throw toApiError(retryError)
    }
  }
}

export const api = {
  register(input: {
    name: string
    email: string
    password: string
    rememberMe?: boolean
  }) {
    return publicRequest<{ register: AuthPayload }>(REGISTER_MUTATION, { input }).then(
      (data) => data.register,
    )
  },

  login(input: { email: string; password: string; rememberMe?: boolean }) {
    return publicRequest<{ login: AuthPayload }>(LOGIN_MUTATION, { input }).then(
      (data) => data.login,
    )
  },

  requestPasswordReset(email: string) {
    return publicRequest<{ requestPasswordReset: { message: string } }>(
      REQUEST_PASSWORD_RESET_MUTATION,
      { email },
    ).then((data) => data.requestPasswordReset)
  },

  resetPassword(token: string, newPassword: string) {
    return publicRequest<{ resetPassword: { message: string } }>(RESET_PASSWORD_MUTATION, {
      token,
      newPassword,
    }).then((data) => data.resetPassword)
  },

  me(token: string) {
    return authenticatedRequest<{ me: User }>(token, ME_QUERY).then((data) => data.me)
  },

  updateMe(token: string, input: { name: string }) {
    return authenticatedRequest<{ updateMe: User }>(token, UPDATE_ME_MUTATION, { input }).then(
      (data) => data.updateMe,
    )
  },

  categories(token: string) {
    return authenticatedRequest<{ categories: Category[] }>(token, CATEGORIES_QUERY).then(
      (data) => data.categories,
    )
  },

  createCategory(
    token: string,
    input: { name: string; description?: string | null; icon?: string; color?: string },
  ) {
    return authenticatedRequest<{ createCategory: Category }>(token, CREATE_CATEGORY_MUTATION, {
      input,
    }).then((data) => data.createCategory)
  },

  updateCategory(
    token: string,
    id: string,
    input: { name: string; description?: string | null; icon?: string; color?: string },
  ) {
    return authenticatedRequest<{ updateCategory: Category }>(token, UPDATE_CATEGORY_MUTATION, {
      id,
      input,
    }).then((data) => data.updateCategory)
  },

  deleteCategory(token: string, id: string) {
    return authenticatedRequest<{ deleteCategory: Pick<Category, 'id' | 'name'> }>(
      token,
      DELETE_CATEGORY_MUTATION,
      { id },
    ).then((data) => data.deleteCategory)
  },

  transactions(token: string) {
    return authenticatedRequest<{ transactions: Transaction[] }>(token, TRANSACTIONS_QUERY).then(
      (data) => data.transactions,
    )
  },

  createTransaction(
    token: string,
    input: {
      description: string
      amount: number
      type: TransactionType
      date: string
      categoryId: string
    },
  ) {
    return authenticatedRequest<{ createTransaction: Transaction }>(
      token,
      CREATE_TRANSACTION_MUTATION,
      { input },
    ).then((data) => data.createTransaction)
  },

  updateTransaction(
    token: string,
    id: string,
    input: {
      description?: string
      amount?: number
      type?: TransactionType
      date?: string
      categoryId?: string
    },
  ) {
    return authenticatedRequest<{ updateTransaction: Transaction }>(
      token,
      UPDATE_TRANSACTION_MUTATION,
      { id, input },
    ).then((data) => data.updateTransaction)
  },

  deleteTransaction(token: string, id: string) {
    return authenticatedRequest<{ deleteTransaction: Pick<Transaction, 'id' | 'description'> }>(
      token,
      DELETE_TRANSACTION_MUTATION,
      { id },
    ).then((data) => data.deleteTransaction)
  },
}

/** Test helpers — not for application code. */
export const __clientTestUtils = {
  isGraphqlUnauthenticated,
}
