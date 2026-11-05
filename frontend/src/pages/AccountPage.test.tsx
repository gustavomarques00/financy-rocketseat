import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../auth/AuthContext'
import { ProtectedRoute } from '../routes/ProtectedRoute'
import { AccountPage } from './AccountPage'

const apiMocks = vi.hoisted(() => ({
  me: vi.fn(),
  categories: vi.fn(),
  transactions: vi.fn(),
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  updateCategory: vi.fn(),
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

const userFixture = {
  id: 'user-1',
  name: 'Conta Visual',
  email: 'visual.qa@example.com',
  createdAt: '2026-11-04T00:00:00.000Z',
  updatedAt: '2026-11-04T00:00:00.000Z',
}

function renderAccount() {
  sessionStorage.setItem('financy.auth.token', 'token-abc')
  apiMocks.me.mockResolvedValue(userFixture)
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/account']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<AccountPage />} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('AccountPage', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('shows the authenticated account as read-only and logs out', async () => {
    const user = userEvent.setup()
    renderAccount()

    expect(await screen.findByRole('heading', { name: 'Conta Visual' })).toBeInTheDocument()
    expect(document.querySelector('.avatar-large')?.textContent).toBe('CV')
    expect(screen.getAllByText('visual.qa@example.com').length).toBeGreaterThan(0)
    expect(screen.getByText('Nome completo')).toBeInTheDocument()
    expect(screen.getByText(/apenas para consulta nesta versão/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /salvar alterações/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /sair da conta/i }))
    expect(await screen.findByText('Login page')).toBeInTheDocument()
  })

  it('redirects anonymous visitors to login', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/account']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/account" element={<AccountPage />} />
            </Route>
            <Route path="/login" element={<div>Login page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(await screen.findByText('Login page')).toBeInTheDocument()
  })
})