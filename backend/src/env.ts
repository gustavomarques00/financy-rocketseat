import { config } from 'dotenv'
import { z } from 'zod'

config()

const envSchema = z.object({
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().min(1).default('15m'),
  JWT_EXPIRES_IN_SESSION: z.string().min(1).default('8h'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().positive().default(30),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  COOKIE_SAMESITE: z.enum(['Lax', 'Strict', 'None']).default('Lax'),
  COOKIE_SECURE: z
    .enum(['true', 'false', 'auto'])
    .default('auto')
    .transform((value) => {
      if (value === 'auto') {
        return undefined
      }
      return value === 'true'
    }),
  MAIL_TRANSPORT: z.enum(['file', 'smtp', 'memory']).default('file'),
  MAIL_DIR: z.string().min(1).default('./.mail'),
  MAIL_FROM: z.string().min(1).default('Financy <noreply@financy.local>'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  /**
   * Comma-separated IP allowlist of reverse proxies that may set X-Forwarded-For.
   * Empty (default) = never trust forwarded headers; use the TCP peer only.
   */
  TRUSTED_PROXIES: z.string().default(''),
})

export type Env = z.infer<typeof envSchema>

export function loadEnv(
  overrides?: Partial<Record<keyof Env | string, string | undefined>>,
): Env {
  const parsed = envSchema.safeParse({
    ...process.env,
    ...overrides,
  })

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n')
    throw new Error(`Invalid environment configuration:\n${details}`)
  }

  const data = parsed.data

  if (data.MAIL_TRANSPORT === 'smtp' && !data.SMTP_HOST) {
    throw new Error('Invalid environment configuration:\nSMTP_HOST: required when MAIL_TRANSPORT=smtp')
  }

  if (data.COOKIE_SAMESITE === 'None' && data.COOKIE_SECURE === false) {
    throw new Error(
      'Invalid environment configuration:\nCOOKIE_SECURE: must be true when COOKIE_SAMESITE=None',
    )
  }

  return data
}
