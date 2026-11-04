import { createServer, type Server } from 'node:http'
import { createYoga } from 'graphql-yoga'
import type { PrismaClient } from '@prisma/client'
import { extractBearerToken, verifyAccessToken } from './auth/jwt.js'
import type { Env } from './env.js'
import { prisma as defaultPrisma } from './lib/prisma.js'
import { schema, type GraphQLContext } from './graphql/schema.js'

export type CreateAppServerResult = {
  server: Server
  yoga: ReturnType<typeof createYoga<GraphQLContext>>
  endpoint: string
}

export type CreateAppServerOptions = {
  prisma?: PrismaClient
}

async function resolveUserId(
  request: Request,
  env: Env,
  prisma: PrismaClient,
): Promise<string | null> {
  const authorization = request.headers.get('authorization')
  if (!authorization) {
    return null
  }

  const token = extractBearerToken(authorization)
  if (!token) {
    return null
  }

  try {
    const payload = await verifyAccessToken(token, env.JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true },
    })
    return user?.id ?? null
  } catch {
    return null
  }
}

export function createAppServer(
  env: Env,
  options: CreateAppServerOptions = {},
): CreateAppServerResult {
  const prisma = options.prisma ?? defaultPrisma

  const yoga = createYoga<GraphQLContext>({
    schema,
    graphqlEndpoint: '/graphql',
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
    context: async ({ request }): Promise<GraphQLContext> => ({
      prisma,
      env,
      userId: await resolveUserId(request, env, prisma),
    }),
    landingPage: env.NODE_ENV !== 'production',
    maskedErrors: env.NODE_ENV === 'production',
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
