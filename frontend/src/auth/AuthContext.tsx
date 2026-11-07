import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { api } from '../lib/graphql/client'
import { getErrorCode } from '../lib/graphql/errors'
import type { User } from '../lib/graphql/types'
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context'
import { isRestoreSuppressed, setRestoreSuppressed } from './logoutBarrier'
import { bindSessionBridge, unbindSessionBridge, type SessionBridge } from './sessionBridge'
import { logoutPersistentSession, refreshAccessToken } from './sessionApi'
import { clearStoredToken, readStoredToken, writeStoredToken } from './tokenStorage'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('bootstrapping')
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const refreshInFlight = useRef<Promise<string | null> | null>(null)
  const tokenRef = useRef<string | null>(null)
  const sessionGeneration = useRef(0)
  const rememberModeRef = useRef(false)

  useEffect(() => {
    tokenRef.current = token
  }, [token])

  const clearSession = useCallback(() => {
    clearStoredToken()
    rememberModeRef.current = false
    setToken(null)
    setUser(null)
    setStatus('anonymous')
  }, [])

  const invalidateSession = useCallback(() => {
    sessionGeneration.current += 1
    refreshInFlight.current = null
    clearSession()
  }, [clearSession])

  const establishSession = useCallback(
    async (nextToken: string, options?: { persistInSessionStorage?: boolean }) => {
      const me = await api.me(nextToken)
      setRestoreSuppressed(false)
      if (options?.persistInSessionStorage !== false) {
        writeStoredToken(nextToken)
        rememberModeRef.current = false
      } else {
        clearStoredToken()
        rememberModeRef.current = true
      }
      setToken(nextToken)
      setUser(me)
      setStatus('authenticated')
    },
    [],
  )

  const coordinatedRefresh = useCallback(async (): Promise<string | null> => {
    if (isRestoreSuppressed()) {
      return null
    }

    const generation = sessionGeneration.current

    if (!refreshInFlight.current) {
      refreshInFlight.current = refreshAccessToken().finally(() => {
        refreshInFlight.current = null
      })
    }

    const refreshed = await refreshInFlight.current

    if (sessionGeneration.current !== generation || isRestoreSuppressed()) {
      return null
    }

    return refreshed
  }, [])

  useEffect(() => {
    const bridge: SessionBridge = {
      getAccessToken: () => tokenRef.current,
      refreshAccessToken: coordinatedRefresh,
      onAccessToken: (nextToken) => {
        if (isRestoreSuppressed()) {
          return
        }
        tokenRef.current = nextToken
        setToken(nextToken)
        if (!rememberModeRef.current) {
          writeStoredToken(nextToken)
        } else {
          clearStoredToken()
        }
        setStatus('authenticated')
      },
      onSessionInvalid: () => {
        invalidateSession()
      },
      getSessionGeneration: () => sessionGeneration.current,
      isRestoreSuppressed,
    }

    bindSessionBridge(bridge)
    return () => {
      unbindSessionBridge(bridge)
    }
  }, [coordinatedRefresh, invalidateSession])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (isRestoreSuppressed()) {
        clearStoredToken()
        if (!cancelled) {
          setStatus('anonymous')
        }
        return
      }

      const stored = readStoredToken()
      if (stored) {
        try {
          const me = await api.me(stored)
          if (!cancelled && !isRestoreSuppressed()) {
            // Prefer token updated by a coordinated refresh inside the GraphQL client.
            const activeToken = tokenRef.current ?? stored
            setToken(activeToken)
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
        if (!cancelled && !isRestoreSuppressed()) {
          clearStoredToken()
          rememberModeRef.current = true
          setToken(refreshed)
          setUser(me)
          setStatus('authenticated')
        }
      } catch {
        if (!cancelled) {
          invalidateSession()
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [coordinatedRefresh, invalidateSession])

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
    const generation = sessionGeneration.current
    const nextUser = await api.updateMe(current, { name })
    if (sessionGeneration.current !== generation || isRestoreSuppressed()) {
      return
    }
    setUser(nextUser)
  }, [])

  const logout = useCallback(async () => {
    // Local logout always wins immediately; remote revoke is best-effort.
    setRestoreSuppressed(true)
    invalidateSession()
    void logoutPersistentSession()
  }, [invalidateSession])

  const handleAuthFailure = useCallback(
    (error: unknown) => {
      if (getErrorCode(error) !== 'UNAUTHENTICATED') {
        return false
      }
      // Client already attempted a coordinated refresh+retry. Treat remaining
      // UNAUTHENTICATED as a hard session end for the UI.
      setRestoreSuppressed(true)
      invalidateSession()
      return true
    },
    [invalidateSession],
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
