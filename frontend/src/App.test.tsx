import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./lib/graphql', () => ({
  fetchHealth: vi.fn(
    () =>
      new Promise(() => {
        /* keep loading state for render smoke test */
      }),
  ),
}))

describe('App', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_BACKEND_URL', 'http://localhost:4000/graphql')
  })

  it('renders Financy foundation screen', () => {
    render(<App />)

    expect(screen.getByText('Financy')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /fundação da aplicação financeira/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/conectando ao graphql/i)).toBeInTheDocument()
  })
})
