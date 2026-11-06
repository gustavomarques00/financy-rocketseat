import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../auth/AuthContext'
import { CategoriesPage } from './CategoriesPage'
import { ApiError } from '../lib/graphql/errors'

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
  name: 'Gustavo',
  email: 'gustavo@example.com',
  createdAt: '2026-11-04T00:00:00.000Z',
  updatedAt: '2026-11-04T00:00:00.000Z',
}

function renderCategories() {
  sessionStorage.setItem('financy.auth.token', 'token-abc')
  apiMocks.me.mockResolvedValue(userFixture)
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/categories']}>
        <Routes>
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('CategoriesPage', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
    apiMocks.transactions.mockResolvedValue([])
  })

  it('lists categories and creates a new one', async () => {
    const user = userEvent.setup()
    apiMocks.categories
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'cat-1', name: 'Moradia', createdAt: '', updatedAt: '' }])
    apiMocks.createCategory.mockResolvedValue({
      id: 'cat-1',
      name: 'Moradia',
      createdAt: '',
      updatedAt: '',
    })

    renderCategories()

    expect(await screen.findByText(/nenhuma categoria/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /nova categoria/i }))
    await user.type(screen.getByLabelText(/título/i), 'Moradia')
    await user.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => {
      expect(apiMocks.createCategory).toHaveBeenCalledWith('token-abc', { name: 'Moradia' })
    })
    expect(await screen.findAllByText('Moradia')).not.toHaveLength(0)
  })

  it('surfaces CATEGORY_IN_USE on delete', async () => {
    const user = userEvent.setup()
    apiMocks.categories.mockResolvedValue([
      { id: 'cat-1', name: 'Moradia', createdAt: '', updatedAt: '' },
    ])
    apiMocks.deleteCategory.mockRejectedValue(
      new ApiError('Cannot delete a category that still has transactions.', 'CATEGORY_IN_USE'),
    )
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderCategories()

    expect(await screen.findAllByText('Moradia')).not.toHaveLength(0)
    await user.click(screen.getByRole('button', { name: /excluir/i }))

    expect(
      await screen.findByText(/existem transações vinculadas/i),
    ).toBeInTheDocument()
  })
})
