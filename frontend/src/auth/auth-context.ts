import { createContext } from 'react'
import type { User } from '../lib/graphql/types'

export type AuthStatus = 'bootstrapping' | 'authenticated' | 'anonymous'

export type AuthContextValue = {
  status: AuthStatus
  user: User | null
  token: string | null
  login: (input: {
    email: string
    password: string
    rememberMe?: boolean
  }) => Promise<void>
  register: (input: {
    name: string
    email: string
    password: string
    rememberMe?: boolean
  }) => Promise<void>
  updateProfile: (name: string) => Promise<void>
  logout: () => Promise<void>
  handleAuthFailure: (error: unknown) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
