import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { DateField } from './DateField'

function Harness() {
  const [value, setValue] = useState('2026-11-15')
  return <DateField id="date" value={value} onChange={setValue} />
}

describe('DateField', () => {
  it('navigates months, selects with the keyboard and closes on Escape', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: /abrir calendário/i }))
    expect(screen.getByRole('dialog', { name: 'Calendário' })).toBeInTheDocument()
    expect(screen.getByText(/novembro de 2026/i)).toBeInTheDocument()

    await user.keyboard('{ArrowRight}{Enter}')
    expect(screen.queryByRole('dialog', { name: 'Calendário' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /16 de novembro de 2026/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /abrir calendário/i }))
    await user.click(screen.getByRole('button', { name: 'Próximo mês' }))
    expect(screen.getByText(/dezembro de 2026/i)).toBeInTheDocument()
    for (let index = 0; index < 13; index += 1) {
      await user.click(screen.getByRole('button', { name: 'Mês anterior' }))
    }
    expect(screen.getByText(/novembro de 2025/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mês atual' }))
    const today = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    expect(screen.getByText(new RegExp(today, 'i'))).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Calendário' })).not.toBeInTheDocument()
  })
})