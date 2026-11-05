/**
 * Session persistence policy:
 * - Prefer in-memory token held by AuthProvider.
 * - Persist a copy in sessionStorage so a tab reload keeps the session
 *   without surviving browser restarts (unlike localStorage).
 * - This is NOT equivalent to HttpOnly cookies; XSS can still read it.
 * - Backend remains the authorization authority via Bearer JWT.
 */
const TOKEN_KEY = 'financy.auth.token'

export function readStoredToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function writeStoredToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Ignore storage quota / privacy mode failures; memory session still works.
  }
}

export function clearStoredToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // no-op
  }
}
