import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { api } from '../lib/graphql/client'
import { getErrorCode } from '../lib/graphql/errors'
import type { User } from '../lib/graphql/types'
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context'
import { logoutPersistentSession, refreshAccessToken } from './sessionApi'
import { clearStoredToken, readStoredToken, writeStoredToken } from './tokenStorage'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('bootstrapping')
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const refreshInFlight = useRef<Promise<string | null> | null>(null)
  const tokenRef = useRef<string | null>(null)

  useEffect(() => {
    tokenRef.current = token
  }, [token])

  const clearSession = useCallback(() => {
    clearStoredToken()
    setToken(null)
    setUser(null)
    setStatus('anonymous')
  }, [])

  const establishSession = useCallback(
    async (nextToken: string, options?: { persistInSessionStorage?: boolean }) => {
      const me = await api.me(nextToken)
      if (options?.persistInSessionStorage !== false) {
        writeStoredToken(nextToken)
      } else {
        clearStoredToken()
      }
      setToken(nextToken)
      setUser(me)
      setStatus('authenticated')
    },
    [],
  )

  const coordinatedRefresh = useCallback(async (): Promise<string | null> => {
    if (!refreshInFlight.current) {
      refreshInFlight.current = refreshAccessToken().finally(() => {
        refreshInFlight.current = null
      })
    }
    return refreshInFlight.current
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const stored = readStoredToken()
      if (stored) {
        try {
          const me = await api.me(stored)
          if (!cancelled) {
            setToken(stored)
            setUser(me)
            setStatus('authenticated')
          }
          return
        } catch {
          clearStoredToken()
        }
      }

      const refreshed = await coordinatedRefresh()
      if (!refreshed) {
        if (!cancelled) {
          setStatus('anonymous')
        }
        return
      }

      try {
        const me = await api.me(refreshed)
        if (!cancelled) {
          clearStoredToken()
          setToken(refreshed)
          setUser(me)
          setStatus('authenticated')
        }
      } catch {
        if (!cancelled) {
          clearSession()
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [clearSession, coordinatedRefresh])

  const login = useCallback(
    async (input: { email: string; password: string; rememberMe?: boolean }) => {
      const rememberMe = input.rememberMe === true
      const payload = await api.login({
        email: input.email,
        password: input.password,
        rememberMe,
      })
      await establishSession(payload.token, {
        persistInSessionStorage: !rememberMe,
      })
    },
    [establishSession],
  )

  const register = useCallback(
    async (input: {
      name: string
      email: string
      password: string
      rememberMe?: boolean
    }) => {
      const rememberMe = input.rememberMe === true
      const payload = await api.register({
        name: input.name,
        email: input.email,
        password: input.password,
        rememberMe,
      })
      await establishSession(payload.token, {
        persistInSessionStorage: !rememberMe,
      })
    },
    [establishSession],
  )

  const updateProfile = useCallback(async (name: string) => {
    const current = tokenRef.current
    if (!current) {
      return
    }
    const nextUser = await api.updateMe(current, { name })
    setUser(nextUser)
  }, [])

  const logout = useCallback(async () => {
    await logoutPersistentSession()
    clearSession()
  }, [clearSession])

  const handleAuthFailure = useCallback(
    (error: unknown) => {
      if (getErrorCode(error) !== 'UNAUTHENTICATED') {
        return false
      }

      void (async () => {
        const refreshed = await coordinatedRefresh()
        if (!refreshed) {
          clearSession()
          return
        }
        try {
          const me = await api.me(refreshed)
          clearStoredToken()
          setToken(refreshed)
          setUser(me)
          setStatus('authenticated')
        } catch {
          clearSession()
        }
      })()

      return true
    },
    [clearSession, coordinatedRefresh],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      token,
      login,
      register,
      updateProfile,
      logout,
      handleAuthFailure,
    }),
    [status, user, token, login, register, updateProfile, logout, handleAuthFailure],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
