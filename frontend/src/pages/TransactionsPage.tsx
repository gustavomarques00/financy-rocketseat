import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import {
  TransactionFormModal,
  type TransactionFormPayload,
} from '../components/transactions/TransactionFormModal'
import { Button } from '../components/ui/Button'
import { EmptyState, Feedback, LoadingBlock } from '../components/ui/Feedback'
import { useFinanceData } from '../hooks/useFinanceData'
import { api } from '../lib/graphql/client'
import { getErrorMessage } from '../lib/graphql/errors'
import type { Transaction } from '../lib/graphql/types'
import { categoryTone } from '../lib/categoryTone'
import { centsToDisplay } from '../lib/money'
import { Icon } from '../components/ui/Icon'

export function TransactionsPage() {
  const { token, handleAuthFailure } = useAuth()
  const navigate = useNavigate()
  const { loading, error, categories, transactions, refresh } = useFinanceData()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [periodFilter, setPeriodFilter] = useState('ALL')
  const [page, setPage] = useState(1)

  const periods = useMemo(() => {
    const labels = new Map<string, string>()
    for (const item of transactions) {
      const date = new Date(item.date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const month = date.toLocaleDateString('pt-BR', { month: 'long' })
      const label = `${month.charAt(0).toUpperCase()}${month.slice(1)} / ${date.getFullYear()}`
      labels.set(key, label)
    }
    return [...labels.entries()].sort((left, right) => right[0].localeCompare(left[0]))
  }, [transactions])

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('pt-BR')
    return transactions.filter((item) => {
      if (needle && !item.description.toLocaleLowerCase('pt-BR').includes(needle)) {
        return false
      }
      if (typeFilter !== 'ALL' && item.type !== typeFilter) {
        return false
      }
      if (categoryFilter !== 'ALL' && item.categoryId !== categoryFilter) {
        return false
      }
      if (periodFilter !== 'ALL') {
        const date = new Date(item.date)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        if (key !== periodFilter) {
          return false
        }
      }
      return true
    })
  }, [transactions, query, typeFilter, categoryFilter, periodFilter])

  const pageSize = 10
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  async function guardRequest<T>(operation: () => Promise<T>): Promise<T | null> {
    try {
      return await operation()
    } catch (err) {
      if (handleAuthFailure(err)) {
        navigate('/login', { replace: true })
        return null
      }
      throw err
    }
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h1>Transações</h1>
          <p className="muted">Gerencie todas as suas transações financeiras</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setFormError(null)
            setModalOpen(true)
          }}
        >
          <Icon name="plus" />
          Nova transação
        </Button>
      </div>

      {loading ? <LoadingBlock /> : null}
      {error ? <Feedback tone="error">{error}</Feedback> : null}
      {actionError ? <Feedback tone="error">{actionError}</Feedback> : null}
      {success ? <Feedback tone="success">{success}</Feedback> : null}

      {!loading && !error ? (
        <div className="panel">
          <div className="filters">
            <label className="field">
              <span className="field-label">Buscar</span>
              <span className="input-shell">
                <Icon name="search" />
                <input
                  className="field-control"
                  value={query}
                  placeholder="Buscar por descrição"
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setPage(1)
                  }}
                />
              </span>
            </label>
            <label className="field">
              <span className="field-label">Tipo</span>
              <select
                className="field-control"
                aria-label="Filtrar por tipo"
                value={typeFilter}
                onChange={(event) => {
                  setTypeFilter(event.target.value as 'ALL' | 'INCOME' | 'EXPENSE')
                  setPage(1)
                }}
              >
                <option value="ALL">Todos</option>
                <option value="INCOME">Entrada</option>
                <option value="EXPENSE">Saída</option>
              </select>
            </label>
            <label className="field">
              <span className="field-label">Categoria</span>
              <select
                className="field-control"
                aria-label="Filtrar por categoria"
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(event.target.value)
                  setPage(1)
                }}
              >
                <option value="ALL">Todas</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Período</span>
              <select
                className="field-control"
                aria-label="Filtrar por período"
                value={periodFilter}
                onChange={(event) => {
                  setPeriodFilter(event.target.value)
                  setPage(1)
                }}
              >
                <option value="ALL">Todos</option>
                {periods.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {transactions.length === 0 ? (
            <EmptyState
              title="Nenhuma transação"
              description="Registre movimentações vinculadas às suas categorias."
            />
          ) : filtered.length === 0 ? (
            <EmptyState title="Nenhuma transação" description="Nenhum resultado para os filtros atuais." />
          ) : (
            <>
            <div className="ledger-head" aria-hidden="true">
              <span>Descrição</span>
              <span>Data</span>
              <span>Categoria</span>
              <span>Tipo</span>
              <span>Valor</span>
              <span>Ações</span>
            </div>
            <ul className="data-list ledger">
              {visible.map((item) => (
                <li key={item.id} className="data-row">
                  <div className="tx-description">
                    <span className={`summary-icon tag tag-${categoryTone(item.category.name)}`}>
                      <Icon name="tag" />
                    </span>
                    <strong>{item.description}</strong>
                  </div>
                  <span className="muted">
                    {new Date(item.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                    })}
                  </span>
                  <span className={`tag tag-${categoryTone(item.category.name)}`}>{item.category.name}</span>
                  <span className={item.type === 'INCOME' ? 'type-indicator positive' : 'type-indicator negative'}>
                    <Icon name={item.type === 'INCOME' ? 'circle-arrow-up' : 'circle-arrow-down'} />
                    {item.type === 'INCOME' ? 'Entrada' : 'Saída'}
                  </span>
                  <strong className={item.type === 'INCOME' ? 'positive' : 'negative'}>
                    {item.type === 'INCOME' ? '+' : '-'} {centsToDisplay(item.amount)}
                  </strong>
                    <div className="row-actions">
                      <Button
                        variant="danger"
                        className="icon-button"
                        aria-label="Excluir"
                        onClick={async () => {
                          if (!token) {
                            return
                          }
                          if (!window.confirm(`Excluir a transação "${item.description}"?`)) {
                            return
                          }
                          setActionError(null)
                          setSuccess(null)
                          try {
                            await guardRequest(() => api.deleteTransaction(token, item.id))
                            setSuccess('Transação excluída.')
                            await refresh()
                          } catch (err) {
                            setActionError(getErrorMessage(err))
                          }
                        }}
                      >
                        <Icon name="trash" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="icon-button"
                        aria-label="Editar"
                        onClick={() => {
                          setEditing(item)
                          setFormError(null)
                          setModalOpen(true)
                        }}
                      >
                        <Icon name="pencil" />
                      </Button>
                    </div>
                </li>
              ))}
            </ul>
            </>
          )}
          {filtered.length > 0 ? (
            <div className="pager">
              <span className="muted">
                {(currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, filtered.length)} |{' '}
                {filtered.length} resultados
              </span>
              <div className="row-actions">
                <Button
                  variant="secondary"
                  className="page-button"
                  aria-label="Página anterior"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <Icon name="chevron-left" />
                </Button>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                  <Button
                    key={number}
                    variant="secondary"
                    className="page-button"
                    aria-current={number === currentPage ? 'page' : undefined}
                    aria-label={`Página ${number}`}
                    onClick={() => setPage(number)}
                  >
                    {number}
                  </Button>
                ))}
                <Button
                  variant="secondary"
                  className="page-button"
                  aria-label="Próxima página"
                  disabled={currentPage === pageCount}
                  onClick={() => setPage(currentPage + 1)}
                >
                  <Icon name="chevron-right" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <TransactionFormModal
        open={modalOpen}
        transaction={editing}
        categories={categories}
        submitting={submitting}
        error={formError}
        onClose={() => {
          if (!submitting) {
            setModalOpen(false)
          }
        }}
        onSubmit={async (values: TransactionFormPayload) => {
          if (!token) {
            return
          }
          setSubmitting(true)
          setFormError(null)
          setSuccess(null)
          try {
            if (editing) {
              await guardRequest(() => api.updateTransaction(token, editing.id, values))
              setSuccess('Transação atualizada.')
            } else {
              await guardRequest(() => api.createTransaction(token, values))
              setSuccess('Transação criada.')
            }
            setModalOpen(false)
            await refresh()
          } catch (err) {
            setFormError(getErrorMessage(err))
          } finally {
            setSubmitting(false)
          }
        }}
      />
    </section>
  )
}
