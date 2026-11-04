import { createSchema } from 'graphql-yoga'
import type { PrismaClient } from '@prisma/client'
import { toGraphQLErrorMessage } from '../errors.js'

export type GraphQLContext = {
  prisma: PrismaClient
}

const typeDefs = /* GraphQL */ `
  type Health {
    status: String!
    service: String!
    timestamp: String!
    database: String!
  }

  type Query {
    health: Health!
  }
`

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
  },
}

export const schema = createSchema({
  typeDefs,
  resolvers,
})
