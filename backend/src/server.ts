import { createServer, type Server } from 'node:http'
import { createYoga } from 'graphql-yoga'
import type { Env } from './env.js'
import { prisma } from './lib/prisma.js'
import { schema, type GraphQLContext } from './graphql/schema.js'

export type CreateAppServerResult = {
  server: Server
  yoga: ReturnType<typeof createYoga<GraphQLContext>>
  endpoint: string
}

export function createAppServer(env: Env): CreateAppServerResult {
  const yoga = createYoga<GraphQLContext>({
    schema,
    graphqlEndpoint: '/graphql',
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
    context: (): GraphQLContext => ({
      prisma,
    }),
    landingPage: env.NODE_ENV !== 'production',
  })

  const server = createServer(yoga)

  return {
    server,
    yoga,
    endpoint: yoga.graphqlEndpoint,
  }
}

export async function startServer(env: Env): Promise<{
  server: Server
  url: string
}> {
  const { server, endpoint } = createAppServer(env)

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(env.PORT, () => resolve())
  })

  const url = `http://localhost:${env.PORT}${endpoint}`
  console.info(`Financy GraphQL ready at ${url}`)
  console.info(`CORS origin allowed: ${env.CORS_ORIGIN}`)

  return { server, url }
}
