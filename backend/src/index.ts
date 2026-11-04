import { loadEnv } from './env.js'
import { startServer } from './server.js'
import { prisma } from './lib/prisma.js'

async function main() {
  const env = loadEnv()
  const { server } = await startServer(env)

  const shutdown = async (signal: string) => {
    console.info(`Received ${signal}. Shutting down...`)
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
    })
    await prisma.$disconnect()
    process.exit(0)
  }

  process.on('SIGINT', () => {
    void shutdown('SIGINT')
  })
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM')
  })
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error)
  await prisma.$disconnect().catch(() => undefined)
  process.exit(1)
})
