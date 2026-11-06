import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const apiMocks = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  me: vi.fn(),
  categories: vi.fn(),
  transactions: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
}))

vi.mock('./lib/graphql/client', () => ({
  api: apiMocks,
}))

vi.mock('./lib/env', () => ({
  getBackendUrl: () => 'http://localhost:4000/graphql',
}))

const userFixture = {
  id: 'user-1',
  name: 'Gustavo',
  email: 'gustavo@example.com',
  createdAt: '2026-11-04T00:00:00.000Z',
  updatedAt: '2026-11-04T00:00:00.000Z',
}

describe('Financy frontend app', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
    apiMocks.me.mockRejectedValue(new Error('UNAUTHENTICATED'))
    apiMocks.categories.mockResolvedValue([])
    apiMocks.transactions.mockResolvedValue([])
  })

  it('shows login for anonymous users and protects private pages', async () => {
    window.history.pushState({}, '', '/transactions')
    render(<App />)

    expect(await screen.findByRole('heading', { name: /fazer login/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
  })

  it('logs in and renders dashboard with real summary data', async () => {
    const user = userEvent.setup()
    apiMocks.login.mockResolvedValue({
      token: 'token-abc',
      user: userFixture,
    })
    apiMocks.me.mockResolvedValue(userFixture)
    apiMocks.transactions.mockResolvedValue([
      {
        id: 'tx-1',
        description: 'Salário',
        amount: 100000,
        type: 'INCOME',
        date: '2026-11-01T12:00:00.000Z',
        categoryId: 'cat-1',
        category: { id: 'cat-1', name: 'Salário' },
        createdAt: '2026-11-01T12:00:00.000Z',
        updatedAt: '2026-11-01T12:00:00.000Z',
      },
      {
        id: 'tx-2',
        description: 'Aluguel',
        amount: 25000,
        type: 'EXPENSE',
        date: '2026-11-02T12:00:00.000Z',
        categoryId: 'cat-2',
        category: { id: 'cat-2', name: 'Moradia' },
        createdAt: '2026-11-02T12:00:00.000Z',
        updatedAt: '2026-11-02T12:00:00.000Z',
      },
    ])

    window.history.pushState({}, '', '/login')
    render(<App />)

    await user.type(await screen.findByLabelText(/e-mail/i), 'gustavo@example.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'password-1')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
    expect(await screen.findByText(/receitas do mês/i)).toBeInTheDocument()
    expect(screen.getByText(/despesas do mês/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText(/750,00/)).toBeInTheDocument()
    })
    expect(screen.getByText('Aluguel')).toBeInTheDocument()
  })

  it('registers a new account from the register page', async () => {
    const user = userEvent.setup()
    apiMocks.register.mockResolvedValue({
      token: 'token-new',
      user: userFixture,
    })
    apiMocks.me.mockResolvedValue(userFixture)

    window.history.pushState({}, '', '/register')
    render(<App />)

    await user.type(await screen.findByLabelText(/nome completo/i), 'Gustavo')
    await user.type(screen.getByLabelText(/e-mail/i), 'gustavo@example.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'password-1')
    await user.click(screen.getByRole('button', { name: /cadastrar/i }))

    expect(apiMocks.register).toHaveBeenCalled()
    expect(await screen.findByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
  })
})
