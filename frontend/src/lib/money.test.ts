import { describe, expect, it } from 'vitest'
import {
  centsToDisplay,
  centsToInputValue,
  parseMoneyInputToCents,
  summarizeTransactions,
} from './money'

describe('money helpers', () => {
  it('formats cents with pt-BR currency', () => {
    expect(centsToDisplay(12345)).toMatch(/R\$\s*123,45/)
  })

  it('parses valid money inputs into cents', () => {
    expect(parseMoneyInputToCents('12,34')).toBe(1234)
    expect(parseMoneyInputToCents('12.5')).toBe(1250)
    expect(parseMoneyInputToCents('2.500,00')).toBe(250000)
    expect(parseMoneyInputToCents('10')).toBe(1000)
  })

  it('rejects invalid or non-positive money inputs', () => {
    expect(parseMoneyInputToCents('')).toBeNull()
    expect(parseMoneyInputToCents('0')).toBeNull()
    expect(parseMoneyInputToCents('-10')).toBeNull()
    expect(parseMoneyInputToCents('12,345')).toBeNull()
    expect(parseMoneyInputToCents('abc')).toBeNull()
  })

  it('converts cents back to input value', () => {
    expect(centsToInputValue(150)).toBe('1,50')
  })

  it('keeps the all-time balance and limits monthly totals to the reference month', () => {
    const reference = new Date(2026, 10, 15)
    expect(
      summarizeTransactions(
        [
          { amount: 100000, type: 'INCOME', date: '2026-11-01T12:00:00.000Z' },
          { amount: 25000, type: 'EXPENSE', date: '2026-11-30T12:00:00.000Z' },
          { amount: 50000, type: 'INCOME', date: '2026-10-31T12:00:00.000Z' },
          { amount: 8000, type: 'EXPENSE', date: '2025-11-15T12:00:00.000Z' },
          { amount: 12000, type: 'INCOME', date: '2026-12-01T12:00:00.000Z' },
        ],
        reference,
      ),
    ).toEqual({
      incomeCents: 100000,
      expenseCents: 25000,
      balanceCents: 129000,
    })
  })

  it('returns zero monthly totals when the month has no transactions', () => {
    expect(
      summarizeTransactions(
        [{ amount: 4000, type: 'EXPENSE', date: '2024-01-15T12:00:00.000Z' }],
        new Date(2026, 10, 1),
      ),
    ).toEqual({
      incomeCents: 0,
      expenseCents: 0,
      balanceCents: -4000,
    })
  })

  it('formats a negative balance without changing the integer cents', () => {
    expect(centsToDisplay(-15000)).toMatch(/-?\s*R\$\s*150,00/)
  })
})
