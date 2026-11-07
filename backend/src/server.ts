import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { createYoga } from 'graphql-yoga'
import type { PrismaClient } from './lib/prisma.js'
import { extractBearerToken, verifyAccessToken } from './auth/jwt.js'
import type { Env } from './env.js'
import { AppError } from './errors.js'
import { parseTrustedProxies, resolveClientIp } from './http/clientIp.js'
import { runWithRequestContext } from './http/requestContext.js'
import { prisma as defaultPrisma } from './lib/prisma.js'
import { schema, type GraphQLContext } from './graphql/schema.js'
import { createMailTransport, MemoryMailTransport } from './mail/transports.js'
import type { MailTransport } from './mail/types.js'
import {
  logoutRefreshSession,
  readRefreshTokenFromCookieHeader,
  rotateRefreshSession,
} from './services/sessions.js'

export type CreateAppServerResult = {
  server: Server
  yoga: ReturnType<typeof createYoga<GraphQLContext>>
  endpoint: string
  mail: MailTransport
}

export type CreateAppServerOptions = {
  prisma?: PrismaClient
  mail?: MailTransport
  memoryMail?: MemoryMailTransport
}

function getClientIp(req: IncomingMessage, env: Env): string {
  return resolveClientIp({
    remoteAddress: req.socket.remoteAddress,
    forwardedFor: req.headers['x-forwarded-for'],
    trustedProxies: parseTrustedProxies(env.TRUSTED_PROXIES),
  })
}

function isAllowedOrigin(env: Env, origin: string | undefined): boolean {
  if (!origin) {
    return true
  }
  return origin === env.CORS_ORIGIN
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
      select: { id: true, sessionVersion: true },
    })
    if (!user || user.sessionVersion !== payload.sessionVersion) {
      return null
    }
    return user.id
  } catch {
    return null
  }
}

function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
  extraHeaders?: Record<string, string | string[]>,
): void {
  const payload = JSON.stringify(body)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          res.appendHeader(key, item)
        }
      } else {
        res.setHeader(key, value)
      }
    }
  }
  res.end(payload)
}

function applyCors(env: Env, req: IncomingMessage, res: ServerResponse): boolean {
  const origin = req.headers.origin
  if (origin && !isAllowedOrigin(env, origin)) {
    res.statusCode = 403
    res.end('Origin not allowed')
    return false
  }
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Financy-CSRF')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  }
  return true
}

async function handleAuthRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  prisma: PrismaClient,
  pathname: string,
): Promise<boolean> {
  if (!pathname.startsWith('/auth/')) {
    return false
  }

  if (!applyCors(env, req, res)) {
    return true
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return true
  }

  const csrfHeader = req.headers['x-financy-csrf']
  if (req.method === 'POST' && csrfHeader !== '1') {
    sendJson(res, 403, { error: 'CSRF validation failed.' })
    return true
  }

  if (pathname === '/auth/refresh' && req.method === 'POST') {
    const raw = readRefreshTokenFromCookieHeader(req.headers.cookie ?? null)
    if (!raw) {
      sendJson(res, 401, { error: 'Authentication required.' })
      return true
    }

    try {
      const result = await rotateRefreshSession(prisma, env, raw)
      const store = { cookies: [] as string[] }
      // cookies were queued via ALS in the outer wrapper
      sendJson(res, 200, { token: result.accessToken })
      void store
    } catch (error) {
      if (error instanceof AppError) {
        sendJson(res, error.statusCode, { error: error.message })
        return true
      }
      sendJson(res, 500, { error: 'Unexpected server error' })
    }
    return true
  }

  if (pathname === '/auth/logout' && req.method === 'POST') {
    await logoutRefreshSession(prisma, env, req.headers.cookie ?? null)
    res.statusCode = 204
    res.end()
    return true
  }

  sendJson(res, 404, { error: 'Not found' })
  return true
}

export function createAppServer(
  env: Env,
  options: CreateAppServerOptions = {},
): CreateAppServerResult {
  const prisma = options.prisma ?? defaultPrisma
  const mail = options.mail ?? createMailTransport(env, options.memoryMail)

  const yoga = createYoga<GraphQLContext>({
    schema,
    graphqlEndpoint: '/graphql',
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Financy-CSRF'],
    },
    context: async ({ request }): Promise<GraphQLContext> => ({
      prisma,
      env,
      mail,
      userId: await resolveUserId(request, env, prisma),
    }),
    landingPage: env.NODE_ENV !== 'production',
    maskedErrors: env.NODE_ENV === 'production',
  })

  const server = createServer((req, res) => {
    const host = req.headers.host ?? `127.0.0.1:${env.PORT}`
    const requestUrl = `http://${host}${req.url ?? '/'}`
    let pathname = '/'
    try {
      pathname = new URL(requestUrl).pathname
    } catch {
      pathname = req.url?.split('?')[0] ?? '/'
    }

    const store = {
      cookiesToSet: [] as string[],
      clientIp: getClientIp(req, env),
      userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : null,
      requestUrl,
    }

    runWithRequestContext(store, () => {
      const originalWriteHead = res.writeHead.bind(res)
      res.writeHead = ((...args: Parameters<typeof res.writeHead>) => {
        for (const cookie of store.cookiesToSet) {
          res.appendHeader('Set-Cookie', cookie)
        }
        return originalWriteHead(...args)
      }) as typeof res.writeHead

      const originalEnd = res.end.bind(res)
      res.end = ((...args: Parameters<typeof res.end>) => {
        if (!res.headersSent) {
          for (const cookie of store.cookiesToSet) {
            res.appendHeader('Set-Cookie', cookie)
          }
        }
        return originalEnd(...args)
      }) as typeof res.end

      void (async () => {
        const handled = await handleAuthRoutes(req, res, env, prisma, pathname)
        if (handled) {
          return
        }
        yoga(req, res)
      })()
    })
  })

  return {
    server,
    yoga,
    endpoint: yoga.graphqlEndpoint,
    mail,
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
