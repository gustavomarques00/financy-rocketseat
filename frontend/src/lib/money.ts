/** Amounts from the API are integer cents. Prefer integer math for aggregates. */

export function centsToDisplay(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

/**
 * Parses a Brazilian-style money input into positive integer cents.
 * When a comma is present it is the decimal separator and dots are thousands
 * separators (`2.500,00`). Without a comma, a dot is the decimal separator (`12.34`).
 * Whole reais (`1234`) are accepted. Zero, negative and extra precision are rejected.
 */
export function parseMoneyInputToCents(raw: string): number | null {
  const trimmed = raw.trim().replace(/\s/g, '')
  if (!trimmed) {
    return null
  }

  const normalized = trimmed.includes(',')
    ? trimmed.replace(/\./g, '').replace(',', '.')
    : trimmed
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null
  }

  const [reaisPart, centsPart = ''] = normalized.split('.')
  const reais = Number(reaisPart)
  const cents = Number((centsPart + '00').slice(0, 2))

  if (!Number.isFinite(reais) || !Number.isFinite(cents)) {
    return null
  }

  const total = reais * 100 + cents
  if (!Number.isInteger(total) || total <= 0) {
    return null
  }

  return total
}

export function centsToInputValue(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

export type MoneyMovement = {
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date?: string
}

/**
 * Financial dates are stored at 12:00 UTC so the calendar day selected by the
 * user is the UTC year and month. The reference month is the viewer's local
 * month, which is the current month when no reference is passed.
 */
export function isInReferenceMonth(isoDate: string, reference: Date): boolean {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) {
    return false
  }

  return (
    date.getUTCFullYear() === reference.getFullYear() &&
    date.getUTCMonth() === reference.getMonth()
  )
}

export function summarizeTransactions(
  transactions: MoneyMovement[],
  reference: Date = new Date(),
): { incomeCents: number; expenseCents: number; balanceCents: number } {
  let totalIncomeCents = 0
  let totalExpenseCents = 0
  let incomeCents = 0
  let expenseCents = 0

  for (const item of transactions) {
    if (item.type === 'INCOME') {
      totalIncomeCents += item.amount
    } else {
      totalExpenseCents += item.amount
    }

    if (!item.date || !isInReferenceMonth(item.date, reference)) {
      continue
    }

    if (item.type === 'INCOME') {
      incomeCents += item.amount
    } else {
      expenseCents += item.amount
    }
  }

  return {
    incomeCents,
    expenseCents,
    balanceCents: totalIncomeCents - totalExpenseCents,
  }
}
