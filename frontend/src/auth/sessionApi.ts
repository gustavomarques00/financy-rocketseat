import { getAuthApiUrl } from '../lib/env'

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(getAuthApiUrl('/auth/refresh'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Financy-CSRF': '1',
      },
    })

    if (!response.ok) {
      return null
    }

    const body = (await response.json()) as { token?: string }
    return typeof body.token === 'string' && body.token.length > 0 ? body.token : null
  } catch {
    return null
  }
}

export async function logoutPersistentSession(): Promise<void> {
  try {
    await fetch(getAuthApiUrl('/auth/logout'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-Financy-CSRF': '1',
      },
    })
  } catch {
    // Best-effort: local session is cleared regardless.
  }
}
