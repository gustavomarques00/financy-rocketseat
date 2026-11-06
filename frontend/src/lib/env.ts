function resolveBackendPath(configured: string | undefined): string {
  const value = configured?.trim()
  if (!value) {
    return '/graphql'
  }
  return value.replace(/\/$/, '') || '/graphql'
}

/**
 * Absolute GraphQL endpoint for graphql-request (requires a valid URL).
 * Relative `/graphql` is resolved against the current origin so Vite proxy
 * keeps refresh cookies first-party in local/e2e setups.
 */
export function getBackendUrl(): string {
  const configured = resolveBackendPath(import.meta.env.VITE_BACKEND_URL)

  if (configured.startsWith('http://') || configured.startsWith('https://')) {
    return configured
  }

  const path = configured.startsWith('/') ? configured : `/${configured}`
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`
  }

  throw new Error(
    'VITE_BACKEND_URL must be an absolute URL when window is unavailable. Copy frontend/.env.example to frontend/.env.',
  )
}

export function getBackendOrigin(): string {
  const graphqlUrl = getBackendUrl()
  try {
    return new URL(graphqlUrl).origin
  } catch {
    return typeof window !== 'undefined' ? window.location.origin : ''
  }
}

export function getAuthApiUrl(path: '/auth/refresh' | '/auth/logout'): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    // Prefer same-origin auth routes (Vite proxy) whenever the page is served by the SPA.
    return `${window.location.origin}${path}`
  }
  return `${getBackendOrigin()}${path}`
}
