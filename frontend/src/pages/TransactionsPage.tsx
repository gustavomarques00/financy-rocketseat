import { useState } from 'react'
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
import { centsToDisplay } from '../lib/money'

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
          <p className="muted">Receitas e despesas do seu usuário autenticado.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setFormError(null)
            setModalOpen(true)
          }}
        >
          Nova transação
        </Button>
      </div>

      {loading ? <LoadingBlock /> : null}
      {error ? <Feedback tone="error">{error}</Feedback> : null}
      {actionError ? <Feedback tone="error">{actionError}</Feedback> : null}
      {success ? <Feedback tone="success">{success}</Feedback> : null}

      {!loading && !error ? (
        <div className="panel">
          {transactions.length === 0 ? (
            <EmptyState
              title="Nenhuma transação"
              description="Registre movimentações vinculadas às suas categorias."
            />
          ) : (
            <ul className="data-list">
              {transactions.map((item) => (
                <li key={item.id} className="data-row">
                  <div>
                    <strong>{item.description}</strong>
                    <p className="muted">
                      {item.category.name} · {new Date(item.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="row-meta">
                    <span className={`tag tag-${item.type.toLowerCase()}`}>
                      {item.type === 'INCOME' ? 'Receita' : 'Despesa'}
                    </span>
                    <strong className={item.type === 'INCOME' ? 'positive' : 'negative'}>
                      {item.type === 'INCOME' ? '+' : '-'}
                      {centsToDisplay(item.amount)}
                    </strong>
                    <div className="row-actions">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditing(item)
                          setFormError(null)
                          setModalOpen(true)
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
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
                        Excluir
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
