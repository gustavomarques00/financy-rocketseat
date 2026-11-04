import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import type { Server } from 'node:http'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PrismaClient } from '@prisma/client'
import { loadEnv, type Env } from '../env.js'
import { createPrismaClient } from '../lib/prisma.js'
import { createAppServer } from '../server.js'

const backendRoot = fileURLToPath(new URL('../..', import.meta.url))
const require = createRequire(import.meta.url)
const prismaCli = require.resolve('prisma/build/index.js')

export type TestApp = {
  url: string
  env: Env
  prisma: PrismaClient
  close: () => Promise<void>
}

let portSeed = 4100

export async function startTestApp(options?: {
  jwtExpiresIn?: string
}): Promise<TestApp> {
  const tempDir = mkdtempSync(join(tmpdir(), 'financy-backend-'))
  const databaseUrl = `file:${join(tempDir, 'test.db').replace(/\\/g, '/')}`
  const port = portSeed++

  process.env.JWT_SECRET = 'test-jwt-secret-min-16-chars'
  process.env.JWT_EXPIRES_IN = options?.jwtExpiresIn ?? '1h'
  process.env.DATABASE_URL = databaseUrl
  process.env.PORT = String(port)
  process.env.CORS_ORIGIN = 'http://localhost:5173'
  process.env.NODE_ENV = 'test'

  execFileSync(process.execPath, [prismaCli, 'migrate', 'deploy'], {
    cwd: backendRoot,
    env: process.env,
    stdio: 'pipe',
  })

  const env = loadEnv({
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    DATABASE_URL: databaseUrl,
    PORT: String(port),
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    NODE_ENV: 'test',
  })

  const prisma = createPrismaClient()
  const app = createAppServer(env, { prisma })
  const server: Server = app.server

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, '127.0.0.1', () => resolve())
  })

  return {
    url: `http://127.0.0.1:${port}${app.endpoint}`,
    env,
    prisma,
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
      })
      await prisma.$disconnect()
      rmSync(tempDir, { recursive: true, force: true })
    },
  }
}
