/** Amounts from the API are integer cents. Prefer integer math for aggregates. */

export function centsToDisplay(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

/**
 * Parses a Brazilian-style money input into positive integer cents.
 * Accepts "12,34", "12.34", "1234" (whole reais), rejects invalid/negative/zero.
 */
export function parseMoneyInputToCents(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }

  const normalized = trimmed.replace(/\s/g, '').replace(',', '.')
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

export function summarizeTransactions(
  transactions: Array<{ amount: number; type: 'INCOME' | 'EXPENSE' }>,
): { incomeCents: number; expenseCents: number; balanceCents: number } {
  let incomeCents = 0
  let expenseCents = 0

  for (const item of transactions) {
    if (item.type === 'INCOME') {
      incomeCents += item.amount
    } else {
      expenseCents += item.amount
    }
  }

  return {
    incomeCents,
    expenseCents,
    balanceCents: incomeCents - expenseCents,
  }
}
