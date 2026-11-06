import { createSchema } from 'graphql-yoga'
import type { PrismaClient } from '../lib/prisma.js'
import type { Env } from '../env.js'
import { mapDomainError, requireAuth, toGraphQLErrorMessage } from '../errors.js'
import type { MailTransport } from '../mail/types.js'
import {
  getAuthenticatedUser,
  loginUser,
  registerUser,
  updateOwnName,
} from '../services/auth.js'
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
} from '../services/categories.js'
import {
  requestPasswordReset,
  resetPassword,
} from '../services/passwordReset.js'
import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  listTransactions,
  updateTransaction,
} from '../services/transactions.js'

export type GraphQLContext = {
  prisma: PrismaClient
  env: Env
  mail: MailTransport
  userId: string | null
}

const typeDefs = /* GraphQL */ `
  enum TransactionType {
    INCOME
    EXPENSE
  }

  type Health {
    status: String!
    service: String!
    timestamp: String!
    database: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Category {
    id: ID!
    name: String!
    description: String
    icon: String!
    color: String!
    createdAt: String!
    updatedAt: String!
  }

  type CategoryRef {
    id: ID!
    name: String!
    icon: String!
    color: String!
  }

  type Transaction {
    id: ID!
    description: String!
    """
    Amount in integer cents (centavos). Always positive; use type for direction.
    """
    amount: Int!
    type: TransactionType!
    date: String!
    categoryId: ID!
    category: CategoryRef!
    createdAt: String!
    updatedAt: String!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
    rememberMe: Boolean
  }

  input LoginInput {
    email: String!
    password: String!
    rememberMe: Boolean
  }

  type PasswordResetRequestResult {
    message: String!
  }

  type PasswordResetResult {
    message: String!
  }

  input CreateCategoryInput {
    name: String!
    description: String
    icon: String
    color: String
  }

  input UpdateCategoryInput {
    name: String!
    description: String
    icon: String
    color: String
  }

  input UpdateMeInput {
    name: String!
  }

  input CreateTransactionInput {
    description: String!
    amount: Int!
    type: TransactionType!
    date: String!
    categoryId: ID!
  }

  input UpdateTransactionInput {
    description: String
    amount: Int
    type: TransactionType
    date: String
    categoryId: ID
  }

  type Query {
    health: Health!
    me: User!
    categories: [Category!]!
    category(id: ID!): Category!
    transactions: [Transaction!]!
    transaction(id: ID!): Transaction!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    requestPasswordReset(email: String!): PasswordResetRequestResult!
    resetPassword(token: String!, newPassword: String!): PasswordResetResult!
    updateMe(input: UpdateMeInput!): User!
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Category!
    createTransaction(input: CreateTransactionInput!): Transaction!
    updateTransaction(id: ID!, input: UpdateTransactionInput!): Transaction!
    deleteTransaction(id: ID!): Transaction!
  }
`

function serializeUser(user: {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

function serializeCategory(category: {
  id: string
  name: string
  description: string | null
  icon: string
  color: string
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    icon: category.icon,
    color: category.color,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  }
}

function serializeTransaction(transaction: {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: Date
  categoryId: string
  createdAt: Date
  updatedAt: Date
  category: { id: string; name: string; icon: string; color: string }
}) {
  return {
    id: transaction.id,
    description: transaction.description,
    amount: transaction.amount,
    type: transaction.type,
    date: transaction.date.toISOString(),
    categoryId: transaction.categoryId,
    category: transaction.category,
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  }
}

const resolvers = {
  Query: {
    health: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      let database = 'ok'

      try {
        await context.prisma.$queryRaw`SELECT 1`
      } catch (error) {
        database = 'error'
        console.error('[health] database check failed:', toGraphQLErrorMessage(error))
      }

      return {
        status: database === 'ok' ? 'ok' : 'degraded',
        service: 'financy-backend',
        timestamp: new Date().toISOString(),
        database,
      }
    },

    me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      try {
        const userId = requireAuth(context.userId)
        const user = await getAuthenticatedUser(context.prisma, userId)
        return serializeUser(user)
      } catch (error) {
        mapDomainError(error)
      }
    },

    categories: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      try {
        const userId = requireAuth(context.userId)
        const categories = await listCategories(context.prisma, userId)
        return categories.map(serializeCategory)
      } catch (error) {
        mapDomainError(error)
      }
    },

    category: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      try {
        const userId = requireAuth(context.userId)
        const category = await getCategory(context.prisma, userId, args.id)
        return serializeCategory(category)
      } catch (error) {
        mapDomainError(error)
      }
    },

    transactions: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      try {
        const userId = requireAuth(context.userId)
        const transactions = await listTransactions(context.prisma, userId)
        return transactions.map(serializeTransaction)
      } catch (error) {
        mapDomainError(error)
      }
    },

    transaction: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      try {
        const userId = requireAuth(context.userId)
        const transaction = await getTransaction(context.prisma, userId, args.id)
        return serializeTransaction(transaction)
      } catch (error) {
        mapDomainError(error)
      }
    },
  },

  Mutation: {
    register: async (
      _parent: unknown,
      args: { input: unknown },
      context: GraphQLContext,
    ) => {
      try {
        const result = await registerUser(context.prisma, context.env, args.input)
        return {
          token: result.token,
          user: serializeUser(result.user),
        }
      } catch (error) {
        mapDomainError(error)
      }
    },

    updateMe: async (
      _parent: unknown,
      args: { input: unknown },
      context: GraphQLContext,
    ) => {
      try {
        const userId = requireAuth(context.userId)
        const user = await updateOwnName(context.prisma, userId, args.input)
        return serializeUser(user)
      } catch (error) {
        mapDomainError(error)
      }
    },

    login: async (
      _parent: unknown,
      args: { input: unknown },
      context: GraphQLContext,
    ) => {
      try {
        const result = await loginUser(context.prisma, context.env, args.input)
        return {
          token: result.token,
          user: serializeUser(result.user),
        }
      } catch (error) {
        mapDomainError(error)
      }
    },

    requestPasswordReset: async (
      _parent: unknown,
      args: { email: string },
      context: GraphQLContext,
    ) => {
      try {
        return await requestPasswordReset(context.prisma, context.env, context.mail, {
          email: args.email,
        })
      } catch (error) {
        mapDomainError(error)
      }
    },

    resetPassword: async (
      _parent: unknown,
      args: { token: string; newPassword: string },
      context: GraphQLContext,
    ) => {
      try {
        return await resetPassword(context.prisma, context.env, {
          token: args.token,
          newPassword: args.newPassword,
        })
      } catch (error) {
        mapDomainError(error)
      }
    },

    createCategory: async (
      _parent: unknown,
      args: { input: unknown },
      context: GraphQLContext,
    ) => {
      try {
        const userId = requireAuth(context.userId)
        const category = await createCategory(context.prisma, userId, args.input)
        return serializeCategory(category)
      } catch (error) {
        mapDomainError(error)
      }
    },

    updateCategory: async (
      _parent: unknown,
      args: { id: string; input: unknown },
      context: GraphQLContext,
    ) => {
      try {
        const userId = requireAuth(context.userId)
        const category = await updateCategory(context.prisma, userId, args.id, args.input)
        return serializeCategory(category)
      } catch (error) {
        mapDomainError(error)
      }
    },

    deleteCategory: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      try {
        const userId = requireAuth(context.userId)
        const category = await deleteCategory(context.prisma, userId, args.id)
        return serializeCategory(category)
      } catch (error) {
        mapDomainError(error)
      }
    },

    createTransaction: async (
      _parent: unknown,
      args: { input: unknown },
      context: GraphQLContext,
    ) => {
      try {
        const userId = requireAuth(context.userId)
        const transaction = await createTransaction(context.prisma, userId, args.input)
        return serializeTransaction(transaction)
      } catch (error) {
        mapDomainError(error)
      }
    },

    updateTransaction: async (
      _parent: unknown,
      args: { id: string; input: unknown },
      context: GraphQLContext,
    ) => {
      try {
        const userId = requireAuth(context.userId)
        const transaction = await updateTransaction(
          context.prisma,
          userId,
          args.id,
          args.input,
        )
        return serializeTransaction(transaction)
      } catch (error) {
        mapDomainError(error)
      }
    },

    deleteTransaction: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      try {
        const userId = requireAuth(context.userId)
        const transaction = await deleteTransaction(context.prisma, userId, args.id)
        return serializeTransaction(transaction)
      } catch (error) {
        mapDomainError(error)
      }
    },
  },
}

export const schema = createSchema({
  typeDefs,
  resolvers,
})
