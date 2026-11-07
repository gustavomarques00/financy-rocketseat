import type { Env } from '../env.js'

export const REFRESH_COOKIE_NAME = 'financy_refresh'

export type CookieOptions = {
  maxAgeSeconds: number
  clear?: boolean
}

function shouldUseSecureCookies(env: Env, requestUrl?: string): boolean {
  if (env.COOKIE_SECURE === true) {
    return true
  }
  if (env.COOKIE_SECURE === false) {
    return false
  }
  if (requestUrl) {
    try {
      return new URL(requestUrl).protocol === 'https:'
    } catch {
      // fall through
    }
  }
  return env.NODE_ENV === 'production'
}

export function buildRefreshCookie(
  env: Env,
  token: string | null,
  options: CookieOptions,
  requestUrl?: string,
): string {
  const secure = shouldUseSecureCookies(env, requestUrl)
  const parts = [
    `${REFRESH_COOKIE_NAME}=${token ?? ''}`,
    'Path=/auth',
    'HttpOnly',
    `SameSite=${env.COOKIE_SAMESITE}`,
    `Max-Age=${options.clear ? 0 : options.maxAgeSeconds}`,
  ]

  if (secure) {
    parts.push('Secure')
  }

  return parts.join('; ')
}

export function parseCookies(header: string | null): Record<string, string> {
  if (!header) {
    return {}
  }

  const out: Record<string, string> = {}
  for (const part of header.split(';')) {
    const index = part.indexOf('=')
    if (index <= 0) {
      continue
    }
    const key = part.slice(0, index).trim()
    const value = part.slice(index + 1).trim()
    if (key) {
      out[key] = decodeURIComponent(value)
    }
  }
  return out
}
