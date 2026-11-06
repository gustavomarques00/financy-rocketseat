import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import {
  TransactionFormModal,
  type TransactionFormPayload,
} from '../components/transactions/TransactionFormModal'
import { EmptyState, Feedback, LoadingBlock } from '../components/ui/Feedback'
import { Icon } from '../components/ui/Icon'
import { useFinanceData } from '../hooks/useFinanceData'
import { api } from '../lib/graphql/client'
import { getErrorMessage } from '../lib/graphql/errors'
import { categoryTone } from '../lib/categoryTone'
import { centsToDisplay, summarizeTransactions } from '../lib/money'

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

export function DashboardPage() {
  const { token, handleAuthFailure } = useAuth()
  const navigate = useNavigate()
  const { loading, error, categories, transactions, refresh } = useFinanceData()
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const summary = summarizeTransactions(transactions)
  const recent = transactions.slice(0, 5)
  const categoryStats = categories
    .map((category) => {
      const related = transactions.filter((item) => item.categoryId === category.id)
      const total = related.reduce((sum, item) => sum + item.amount, 0)
      return { ...category, count: related.length, total }
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pt-BR'))
    .slice(0, 5)

  return (
    <section className="page-section">
      <h1 className="sr-only">Dashboard</h1>
      {loading ? <LoadingBlock /> : null}
      {error ? <Feedback tone="error">{error}</Feedback> : null}
      {success ? <Feedback tone="success">{success}</Feedback> : null}

      {!loading && !error ? (
        <>
          <div className="summary-grid">
            <article className="summary-card">
              <p className="summary-label">
                <span className="summary-icon tag tag-purple"><Icon name="wallet" /></span>
                <span className="eyebrow">Saldo total</span>
              </p>
              <p className="summary-value">{centsToDisplay(summary.balanceCents)}</p>
            </article>
            <article className="summary-card">
              <p className="summary-label">
                <span className="summary-icon tag tag-green"><Icon name="circle-arrow-up" /></span>
                <span className="eyebrow">Receitas do mês</span>
              </p>
              <p className="summary-value">{centsToDisplay(summary.incomeCents)}</p>
            </article>
            <article className="summary-card">
              <p className="summary-label">
                <span className="summary-icon tag tag-red"><Icon name="circle-arrow-down" /></span>
                <span className="eyebrow">Despesas do mês</span>
              </p>
              <p className="summary-value">{centsToDisplay(summary.expenseCents)}</p>
            </article>
          </div>

          <div className="dashboard-grid">
            <div className="panel">
              <div className="panel-header">
                <h2>Transações recentes</h2>
                <Link to="/transactions">
                  Ver todas
                  <Icon name="chevron-right" />
                </Link>
              </div>
              {recent.length === 0 ? (
                <EmptyState
                  title="Nenhuma transação ainda"
                  description="Crie categorias e registre sua primeira movimentação."
                />
              ) : (
                <ul className="data-list">
                  {recent.map((item) => (
                    <li key={item.id} className="data-row">
                      <div className="tx-description">
                        <span className={`summary-icon tag tag-${categoryTone(item.category.name)}`}>
                          <Icon name="tag" />
                        </span>
                        <div>
                          <strong>{item.description}</strong>
                          <p className="muted">{shortDate(item.date)}</p>
                        </div>
                      </div>
                      <div className="row-meta">
                        <span className={`tag tag-${categoryTone(item.category.name)}`}>
                          {item.category.name}
                        </span>
                        <strong className={item.type === 'INCOME' ? 'type-indicator positive' : 'type-indicator negative'}>
                          {item.type === 'INCOME' ? '+' : '-'} {centsToDisplay(item.amount)}
                          <Icon name={item.type === 'INCOME' ? 'circle-arrow-up' : 'circle-arrow-down'} />
                        </strong>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                className="text-link panel-footer-link"
                onClick={() => {
                  setFormError(null)
                  setModalOpen(true)
                }}
              >
                <Icon name="plus" />
                Nova transação
              </button>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h2>Categorias</h2>
                <Link to="/categories">
                  Gerenciar
                  <Icon name="chevron-right" />
                </Link>
              </div>
              {categoryStats.length === 0 ? (
                <EmptyState
                  title="Nenhuma categoria"
                  description="Organize receitas e despesas em categorias."
                />
              ) : (
                <ul className="data-list">
                  {categoryStats.map((category) => (
                    <li key={category.id} className="data-row">
                      <span className={`tag tag-${categoryTone(category.name)}`}>{category.name}</span>
                      <span className="muted">
                        {category.count} {category.count === 1 ? 'item' : 'itens'}
                      </span>
                      <strong>{centsToDisplay(category.total)}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      ) : null}

      <TransactionFormModal
        open={modalOpen}
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
            await api.createTransaction(token, values)
            setSuccess('Transação criada.')
            setModalOpen(false)
            await refresh()
          } catch (err) {
            if (handleAuthFailure(err)) {
              navigate('/login', { replace: true })
              return
            }
            setFormError(getErrorMessage(err))
          } finally {
            setSubmitting(false)
          }
        }}
      />
    </section>
  )
}
