import { Link } from 'react-router-dom'
import { EmptyState, Feedback, LoadingBlock } from '../components/ui/Feedback'
import { useFinanceData } from '../hooks/useFinanceData'
import { categoryTone } from '../lib/categoryTone'
import { centsToDisplay, summarizeTransactions } from '../lib/money'
import { Icon } from '../components/ui/Icon'

export function DashboardPage() {
  const { loading, error, categories, transactions } = useFinanceData()
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
                <span className="summary-icon tag tag-green"><Icon name="trending-up" /></span>
                <span className="eyebrow">Receitas do mês</span>
              </p>
              <p className="summary-value">{centsToDisplay(summary.incomeCents)}</p>
            </article>
            <article className="summary-card">
              <p className="summary-label">
                <span className="summary-icon tag tag-red"><Icon name="trending-down" /></span>
                <span className="eyebrow">Despesas do mês</span>
              </p>
              <p className="summary-value">{centsToDisplay(summary.expenseCents)}</p>
            </article>
          </div>

          <div className="dashboard-grid">
            <div className="panel">
              <div className="panel-header">
                <h2>Transações recentes</h2>
                <Link to="/transactions">Ver todas</Link>
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
                      <div>
                        <strong>{item.description}</strong>
                        <p className="muted">
                          {new Date(item.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="row-meta">
                        <span className={`tag tag-${categoryTone(item.category.name)}`}>
                          {item.category.name}
                        </span>
                        <strong className={item.type === 'INCOME' ? 'positive' : 'negative'}>
                          {item.type === 'INCOME' ? '+' : '-'} {centsToDisplay(item.amount)}
                        </strong>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Link className="text-link panel-footer-link" to="/transactions">
                + Nova transação
              </Link>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h2>Categorias</h2>
                <Link to="/categories">Gerenciar</Link>
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
    </section>
  )
}
