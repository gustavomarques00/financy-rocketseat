import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { api } from '../lib/graphql/client'
import { getErrorMessage } from '../lib/graphql/errors'
import type { Category, Transaction } from '../lib/graphql/types'

type FinanceState = {
  loading: boolean
  error: string | null
  categories: Category[]
  transactions: Transaction[]
  refresh: () => Promise<void>
}

export function useFinanceData(): FinanceState {
  const { token, handleAuthFailure } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [reloadKey, setReloadKey] = useState(0)

  const refresh = useCallback(async () => {
    setReloadKey((value) => value + 1)
  }, [])

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const [nextCategories, nextTransactions] = await Promise.all([
          api.categories(token!),
          api.transactions(token!),
        ])
        if (!cancelled) {
          setCategories(nextCategories)
          setTransactions(nextTransactions)
        }
      } catch (err) {
        if (cancelled) {
          return
        }
        if (handleAuthFailure(err)) {
          navigate('/login', { replace: true })
          return
        }
        setError(getErrorMessage(err, 'Não foi possível carregar os dados.'))
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [token, handleAuthFailure, navigate, reloadKey])

  return { loading, error, categories, transactions, refresh }
}
