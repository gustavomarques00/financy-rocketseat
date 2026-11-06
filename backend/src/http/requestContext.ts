import { AsyncLocalStorage } from 'node:async_hooks'

export type RequestContextStore = {
  cookiesToSet: string[]
  clientIp: string
  userAgent: string | null
  requestUrl: string
}

const storage = new AsyncLocalStorage<RequestContextStore>()

export function runWithRequestContext<T>(
  store: RequestContextStore,
  fn: () => T,
): T {
  return storage.run(store, fn)
}

export function getRequestContext(): RequestContextStore | undefined {
  return storage.getStore()
}

export function queueSetCookie(cookie: string): void {
  const store = storage.getStore()
  if (!store) {
    return
  }
  store.cookiesToSet.push(cookie)
}
