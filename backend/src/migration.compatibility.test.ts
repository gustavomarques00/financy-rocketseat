import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { createPrismaClient } from './lib/prisma.js'

const backendRoot = fileURLToPath(new URL('..', import.meta.url))
const require = createRequire(import.meta.url)
const prismaCli = require.resolve('prisma/build/index.js')
const initMigrationPath = join(
  backendRoot,
  'prisma',
  'migrations',
  '20261104220000_init',
  'migration.sql',
)

const directories: string[] = []

function assertLocalTestDatabase(databaseUrl: string, directory: string): void {
  if (!databaseUrl.startsWith('file:') || databaseUrl.includes('dev.db')) {
    throw new Error('Migration test refused a non-temporary database.')
  }
  if (!directory.includes('financy-migrate-')) {
    throw new Error('Migration test directory is outside the temporary prefix.')
  }
}

function runPrisma(args: string[], databaseUrl: string): void {
  execFileSync(process.execPath, [prismaCli, ...args], {
    cwd: backendRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'pipe',
  })
}

describe('category appearance migration', () => {
  afterEach(() => {
    for (const directory of directories.splice(0)) {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('applies on an empty database and preserves a legacy category with transactions', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'financy-migrate-'))
    directories.push(directory)
    const databaseUrl = `file:${join(directory, 'legacy.db').replace(/\\/g, '/')}`
    assertLocalTestDatabase(databaseUrl, directory)

    runPrisma(['db', 'execute', '--file', initMigrationPath], databaseUrl)

    const checksum = createHash('sha256').update(readFileSync(initMigrationPath)).digest('hex')
    const seedPath = join(directory, 'seed.sql')
    writeFileSync(
      seedPath,
      `
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "checksum" TEXT NOT NULL,
  "finished_at" DATETIME,
  "migration_name" TEXT NOT NULL,
  "logs" TEXT,
  "rolled_back_at" DATETIME,
  "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "started_at", "applied_steps_count")
VALUES ('legacy-init', '${checksum}', CURRENT_TIMESTAMP, '20261104220000_init', CURRENT_TIMESTAMP, 1);
INSERT INTO "User" ("id", "name", "email", "passwordHash", "createdAt", "updatedAt")
VALUES ('user-legacy', 'Legacy User', 'legacy@example.com', 'not-a-login-hash', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO "Category" ("id", "name", "userId", "createdAt", "updatedAt")
VALUES ('cat-legacy', 'Legacy', 'user-legacy', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO "Transaction" ("id", "description", "amount", "type", "date", "categoryId", "userId", "createdAt", "updatedAt")
VALUES ('tx-legacy', 'Saldo antigo', 1500, 'INCOME', '2026-01-15T12:00:00.000Z', 'cat-legacy', 'user-legacy', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
`,
    )
    runPrisma(['db', 'execute', '--file', seedPath], databaseUrl)
    runPrisma(['migrate', 'deploy'], databaseUrl)

    const prisma = createPrismaClient(databaseUrl)
    try {
      const category = await prisma.category.findUniqueOrThrow({
        where: { id: 'cat-legacy' },
        include: { transactions: true, user: true },
      })

      expect(category.name).toBe('Legacy')
      expect(category.userId).toBe('user-legacy')
      expect(category.user.email).toBe('legacy@example.com')
      expect(category.description).toBeNull()
      expect(category.icon).toBe('tag')
      expect(category.color).toBe('green')
      expect(category.transactions).toEqual([
        expect.objectContaining({ id: 'tx-legacy', amount: 1500, categoryId: 'cat-legacy' }),
      ])

      const user = await prisma.user.findUniqueOrThrow({ where: { id: 'user-legacy' } })
      expect(user.sessionVersion).toBe(0)
    } finally {
      await prisma.$disconnect()
    }
  })
})
