/**
 * Non-React bridge so the GraphQL client can coordinate refresh/retry without
 * importing AuthContext (avoids circular dependencies).
 */

export type SessionBridge = {
  getAccessToken: () => string | null
  refreshAccessToken: () => Promise<string | null>
  onAccessToken: (token: string) => void
  onSessionInvalid: () => void
  getSessionGeneration: () => number
  isRestoreSuppressed: () => boolean
}

let bridge: SessionBridge | null = null

export function bindSessionBridge(next: SessionBridge): void {
  bridge = next
}

export function unbindSessionBridge(current?: SessionBridge): void {
  if (!current || bridge === current) {
    bridge = null
  }
}

export function getSessionBridge(): SessionBridge | null {
  return bridge
}
