import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '../lib/graphql/client'
import { getErrorCode } from '../lib/graphql/errors'
import type { User } from '../lib/graphql/types'
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context'
import { clearStoredToken, readStoredToken, writeStoredToken } from './tokenStorage'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('bootstrapping')
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  const clearSession = useCallback(() => {
    clearStoredToken()
    setToken(null)
    setUser(null)
    setStatus('anonymous')
  }, [])

  const establishSession = useCallback(async (nextToken: string) => {
    const me = await api.me(nextToken)
    writeStoredToken(nextToken)
    setToken(nextToken)
    setUser(me)
    setStatus('authenticated')
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const stored = readStoredToken()
      if (!stored) {
        if (!cancelled) {
          setStatus('anonymous')
        }
        return
      }

      try {
        const me = await api.me(stored)
        if (!cancelled) {
          setToken(stored)
          setUser(me)
          setStatus('authenticated')
        }
      } catch {
        clearStoredToken()
        if (!cancelled) {
          setToken(null)
          setUser(null)
          setStatus('anonymous')
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      const payload = await api.login(input)
      await establishSession(payload.token)
    },
    [establishSession],
  )

  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const payload = await api.register(input)
      await establishSession(payload.token)
    },
    [establishSession],
  )

  const updateProfile = useCallback(
    async (name: string) => {
      if (!token) {
        return
      }
      const nextUser = await api.updateMe(token, { name })
      setUser(nextUser)
    },
    [token],
  )

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  const handleAuthFailure = useCallback(
    (error: unknown) => {
      if (getErrorCode(error) === 'UNAUTHENTICATED') {
        clearSession()
        return true
      }
      return false
    },
    [clearSession],
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
