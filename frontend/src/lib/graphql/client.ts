import { GraphQLClient } from 'graphql-request'
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

  return new GraphQLClient(getBackendUrl(), { headers })
}

async function request<T>(
  token: string | null | undefined,
  document: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  try {
    return await createGraphqlClient(token).request<T>(document, variables)
  } catch (error) {
    throw toApiError(error)
  }
}

export const api = {
  register(input: { name: string; email: string; password: string }) {
    return request<{ register: AuthPayload }>(null, REGISTER_MUTATION, { input }).then(
      (data) => data.register,
    )
  },

  login(input: { email: string; password: string }) {
    return request<{ login: AuthPayload }>(null, LOGIN_MUTATION, { input }).then(
      (data) => data.login,
    )
  },

  me(token: string) {
    return request<{ me: User }>(token, ME_QUERY).then((data) => data.me)
  },

  categories(token: string) {
    return request<{ categories: Category[] }>(token, CATEGORIES_QUERY).then(
      (data) => data.categories,
    )
  },

  createCategory(token: string, input: { name: string }) {
    return request<{ createCategory: Category }>(token, CREATE_CATEGORY_MUTATION, {
      input,
    }).then((data) => data.createCategory)
  },

  updateCategory(token: string, id: string, input: { name: string }) {
    return request<{ updateCategory: Category }>(token, UPDATE_CATEGORY_MUTATION, {
      id,
      input,
    }).then((data) => data.updateCategory)
  },

  deleteCategory(token: string, id: string) {
    return request<{ deleteCategory: Pick<Category, 'id' | 'name'> }>(
      token,
      DELETE_CATEGORY_MUTATION,
      { id },
    ).then((data) => data.deleteCategory)
  },

  transactions(token: string) {
    return request<{ transactions: Transaction[] }>(token, TRANSACTIONS_QUERY).then(
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
    return request<{ createTransaction: Transaction }>(
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
    return request<{ updateTransaction: Transaction }>(
      token,
      UPDATE_TRANSACTION_MUTATION,
      { id, input },
    ).then((data) => data.updateTransaction)
  },

  deleteTransaction(token: string, id: string) {
    return request<{ deleteTransaction: Pick<Transaction, 'id' | 'description'> }>(
      token,
      DELETE_TRANSACTION_MUTATION,
      { id },
    ).then((data) => data.deleteTransaction)
  },
}
