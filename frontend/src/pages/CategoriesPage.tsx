import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { CategoryFormModal } from '../components/categories/CategoryFormModal'
import { Button } from '../components/ui/Button'
import { EmptyState, Feedback, LoadingBlock } from '../components/ui/Feedback'
import { useFinanceData } from '../hooks/useFinanceData'
import { api } from '../lib/graphql/client'
import { getErrorCode, getErrorMessage } from '../lib/graphql/errors'
import { categoryTone } from '../lib/categoryTone'
import { Icon } from '../components/ui/Icon'
import type { Category } from '../lib/graphql/types'

export function CategoriesPage() {
  const { token, handleAuthFailure } = useAuth()
  const navigate = useNavigate()
  const { loading, error, categories, transactions, refresh } = useFinanceData()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
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
          <h1>Categorias</h1>
          <p className="muted">Organize suas transações por categorias</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setFormError(null)
            setModalOpen(true)
          }}
        >
          Nova categoria
        </Button>
      </div>

      {loading ? <LoadingBlock /> : null}
      {error ? <Feedback tone="error">{error}</Feedback> : null}
      {actionError ? <Feedback tone="error">{actionError}</Feedback> : null}
      {success ? <Feedback tone="success">{success}</Feedback> : null}

      {!loading && !error ? (
        <div className="panel">
          <div className="summary-grid summary-grid-compact">
            <article className="summary-card">
              <p className="summary-value">{categories.length}</p>
              <p className="eyebrow">Total de categorias</p>
            </article>
            <article className="summary-card">
              <p className="summary-value">{transactions.length}</p>
              <p className="eyebrow">Total de transações</p>
            </article>
            <article className="summary-card">
              <p className="summary-value">
                {categories.length === 0
                  ? '—'
                  : [...categories].sort((a, b) => {
                      const countA = transactions.filter((item) => item.categoryId === a.id).length
                      const countB = transactions.filter((item) => item.categoryId === b.id).length
                      return countB - countA || a.name.localeCompare(b.name, 'pt-BR')
                    })[0]?.name}
              </p>
              <p className="eyebrow">Categoria mais utilizada</p>
            </article>
          </div>
          {categories.length === 0 ? (
            <EmptyState
              title="Nenhuma categoria"
              description="Crie categorias para classificar suas transações."
            />
          ) : (
            <ul className="category-grid">
              {categories.map((category) => {
                const count = transactions.filter((item) => item.categoryId === category.id).length
                return (
                <li key={category.id} className="category-card">
                  <div className="category-card-top">
                    <strong>{category.name}</strong>
                    <div className="row-actions">
                    <Button
                      variant="ghost"
                      className="icon-button"
                      aria-label="Editar"
                      onClick={() => {
                        setEditing(category)
                        setFormError(null)
                        setModalOpen(true)
                      }}
                    >
                      <Icon name="pencil" />
                    </Button>
                    <Button
                      variant="danger"
                      className="icon-button"
                      aria-label="Excluir"
                      onClick={async () => {
                        if (!token) {
                          return
                        }
                        if (!window.confirm(`Excluir a categoria "${category.name}"?`)) {
                          return
                        }
                        setActionError(null)
                        setSuccess(null)
                        try {
                          await guardRequest(() => api.deleteCategory(token, category.id))
                          setSuccess('Categoria excluída.')
                          await refresh()
                        } catch (err) {
                          if (getErrorCode(err) === 'CATEGORY_IN_USE') {
                            setActionError(
                              'Não é possível excluir: existem transações vinculadas a esta categoria.',
                            )
                          } else {
                            setActionError(getErrorMessage(err))
                          }
                        }
                      }}
                    >
                      <Icon name="trash" />
                    </Button>
                    </div>
                  </div>
                  <span className={`tag tag-${categoryTone(category.name)}`}>{category.name}</span>
                  <span className="muted">
                    {count} {count === 1 ? 'item' : 'itens'}
                  </span>
                </li>
                )
              })}
            </ul>
          )}
        </div>
      ) : null}

      <CategoryFormModal
        open={modalOpen}
        category={editing}
        submitting={submitting}
        error={formError}
        onClose={() => {
          if (!submitting) {
            setModalOpen(false)
          }
        }}
        onSubmit={async (values) => {
          if (!token) {
            return
          }
          setSubmitting(true)
          setFormError(null)
          setSuccess(null)
          try {
            if (editing) {
              await guardRequest(() => api.updateCategory(token, editing.id, values))
              setSuccess('Categoria atualizada.')
            } else {
              await guardRequest(() => api.createCategory(token, values))
              setSuccess('Categoria criada.')
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
