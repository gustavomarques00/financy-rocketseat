import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'
import { ApiError } from '../lib/graphql/errors'

const apiMocks = vi.hoisted(() => ({
  me: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  categories: vi.fn(),
  transactions: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
}))

vi.mock('../lib/graphql/client', () => ({
  api: apiMocks,
}))

vi.mock('../lib/env', () => ({
  getBackendUrl: () => 'http://localhost:4000/graphql',
}))

function Probe() {
  const auth = useAuth()
  return (
    <div>
      <p>status:{auth.status}</p>
      <p>user:{auth.user?.email ?? 'none'}</p>
      <button type="button" onClick={() => void auth.login({ email: 'a@b.com', password: 'password-1' })}>
        login
      </button>
      <button type="button" onClick={() => auth.logout()}>
        logout
      </button>
      <button
        type="button"
        onClick={() => auth.handleAuthFailure(new ApiError('Authentication required.', 'UNAUTHENTICATED'))}
      >
        expire
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('bootstraps anonymous session when token is absent', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    expect(await screen.findByText('status:anonymous')).toBeInTheDocument()
  })

  it('logs in, persists token, and clears session on logout', async () => {
    const user = userEvent.setup()
    apiMocks.login.mockResolvedValue({
      token: 'token-1',
      user: {
        id: '1',
        name: 'A',
        email: 'a@b.com',
        createdAt: '',
        updatedAt: '',
      },
    })
    apiMocks.me.mockResolvedValue({
      id: '1',
      name: 'A',
      email: 'a@b.com',
      createdAt: '',
      updatedAt: '',
    })

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await user.click(await screen.findByRole('button', { name: 'login' }))
    await waitFor(() => {
      expect(screen.getByText('status:authenticated')).toBeInTheDocument()
    })
    expect(sessionStorage.getItem('financy.auth.token')).toBe('token-1')

    await user.click(screen.getByRole('button', { name: 'logout' }))
    expect(screen.getByText('status:anonymous')).toBeInTheDocument()
    expect(sessionStorage.getItem('financy.auth.token')).toBeNull()
  })

  it('clears session on UNAUTHENTICATED auth failure', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem('financy.auth.token', 'token-1')
    apiMocks.me.mockResolvedValue({
      id: '1',
      name: 'A',
      email: 'a@b.com',
      createdAt: '',
      updatedAt: '',
    })

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('status:authenticated')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'expire' }))
    expect(screen.getByText('status:anonymous')).toBeInTheDocument()
    expect(sessionStorage.getItem('financy.auth.token')).toBeNull()
  })
})
