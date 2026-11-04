import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Server } from 'node:http'
import { loadEnv } from './env.js'
import { createAppServer } from './server.js'
import { prisma } from './lib/prisma.js'

const TEST_PORT = 4010

describe('GraphQL health query', () => {
  let server: Server
  let url: string

  beforeAll(async () => {
    process.env.JWT_SECRET ??= 'test-jwt-secret-min-16-chars'
    process.env.DATABASE_URL ??= 'file:./test.db'
    process.env.PORT = String(TEST_PORT)
    process.env.CORS_ORIGIN ??= 'http://localhost:5173'
    process.env.NODE_ENV = 'test'

    const env = loadEnv()
    const app = createAppServer(env)

    server = app.server
    url = `http://127.0.0.1:${TEST_PORT}${app.endpoint}`

    await new Promise<void>((resolve, reject) => {
      server.once('error', reject)
      server.listen(TEST_PORT, '127.0.0.1', () => resolve())
    })
  })

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
    })
    await prisma.$disconnect()
  })

  it('returns diagnostic health payload', async () => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: /* GraphQL */ `
          query HealthCheck {
            health {
              status
              service
              timestamp
              database
            }
          }
        `,
      }),
    })

    expect(response.status).toBe(200)

    const body = (await response.json()) as {
      data?: {
        health: {
          status: string
          service: string
          timestamp: string
          database: string
        }
      }
      errors?: unknown[]
    }

    expect(body.errors).toBeUndefined()
    expect(body.data?.health.service).toBe('financy-backend')
    expect(['ok', 'degraded']).toContain(body.data?.health.status)
    expect(['ok', 'error']).toContain(body.data?.health.database)
    expect(body.data?.health.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
