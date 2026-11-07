/**
 * After logout, suppress automatic session restore from a leftover HttpOnly
 * refresh cookie until the user explicitly signs in again.
 * sessionStorage is intentional: it covers reload in the same tab/session
 * without creating durable cross-browser persistence.
 */
const SUPPRESS_RESTORE_KEY = 'financy.auth.suppress-restore'

export function setRestoreSuppressed(value: boolean): void {
  try {
    if (value) {
      sessionStorage.setItem(SUPPRESS_RESTORE_KEY, '1')
    } else {
      sessionStorage.removeItem(SUPPRESS_RESTORE_KEY)
    }
  } catch {
    // ignore
  }
}

export function isRestoreSuppressed(): boolean {
  try {
    return sessionStorage.getItem(SUPPRESS_RESTORE_KEY) === '1'
  } catch {
    return false
  }
}
