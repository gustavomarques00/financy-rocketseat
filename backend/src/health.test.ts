import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { graphqlRequest } from './test/graphql-client.js'
import { startTestApp, type TestApp } from './test/test-app.js'

describe('GraphQL health query', () => {
  let app: TestApp

  beforeAll(async () => {
    app = await startTestApp()
  }, 60_000)

  afterAll(async () => {
    if (app) {
      await app.close()
    }
  })

  it('returns diagnostic health payload', async () => {
    const body = await graphqlRequest<{
      health: {
        status: string
        service: string
        timestamp: string
        database: string
      }
    }>(
      app.url,
      /* GraphQL */ `
        query HealthCheck {
          health {
            status
            service
            timestamp
            database
          }
        }
      `,
    )

    expect(body.errors).toBeUndefined()
    expect(body.data?.health.service).toBe('financy-backend')
    expect(['ok', 'degraded']).toContain(body.data?.health.status)
    expect(['ok', 'error']).toContain(body.data?.health.database)
    expect(body.data?.health.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
