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

  it('summarizes income expense and balance with integer math', () => {
    expect(
      summarizeTransactions([
        { amount: 10000, type: 'INCOME' },
        { amount: 2500, type: 'EXPENSE' },
        { amount: 500, type: 'EXPENSE' },
      ]),
    ).toEqual({
      incomeCents: 10000,
      expenseCents: 3000,
      balanceCents: 7000,
    })
  })
})
