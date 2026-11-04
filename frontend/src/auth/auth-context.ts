import { createContext } from 'react'
import type { User } from '../lib/graphql/types'

export type AuthStatus = 'bootstrapping' | 'authenticated' | 'anonymous'

export type AuthContextValue = {
  status: AuthStatus
  user: User | null
  token: string | null
  login: (input: { email: string; password: string }) => Promise<void>
  register: (input: { name: string; email: string; password: string }) => Promise<void>
  logout: () => void
  handleAuthFailure: (error: unknown) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
