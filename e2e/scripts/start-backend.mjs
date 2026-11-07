import { spawn } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const e2eRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const backendRoot = join(e2eRoot, '..', 'backend')
const tmpDir = join(e2eRoot, '.tmp')
const databasePath = join(tmpDir, 'e2e.db').replaceAll('\\', '/')

mkdirSync(tmpDir, { recursive: true })
rmSync(databasePath, { force: true })

const require = createRequire(join(backendRoot, 'package.json'))
const prismaCli = require.resolve('prisma/build/index.js')

const env = {
  ...process.env,
  JWT_SECRET: 'e2e-jwt-secret-min-16',
  JWT_EXPIRES_IN: '1h',
  JWT_EXPIRES_IN_SESSION: '1h',
  DATABASE_URL: `file:${databasePath}`,
  PORT: '4100',
  CORS_ORIGIN: 'http://127.0.0.1:5174',
  FRONTEND_URL: 'http://127.0.0.1:5174',
  MAIL_TRANSPORT: 'file',
  MAIL_DIR: join(tmpDir, 'mail'),
  COOKIE_SECURE: 'false',
  COOKIE_SAMESITE: 'Lax',
  NODE_ENV: 'test',
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: backendRoot,
      env,
      stdio: 'inherit',
    })
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`${command} exited with ${code}`))
    })
  })
}

await run(process.execPath, [prismaCli, 'migrate', 'deploy'])
await run(process.execPath, [join(backendRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs'), 'src/index.ts'])
