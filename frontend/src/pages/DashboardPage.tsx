import { Link } from 'react-router-dom'
import { EmptyState, Feedback, LoadingBlock } from '../components/ui/Feedback'
import { useFinanceData } from '../hooks/useFinanceData'
import { centsToDisplay, summarizeTransactions } from '../lib/money'

export function DashboardPage() {
  const { loading, error, transactions } = useFinanceData()
  const summary = summarizeTransactions(transactions)
  const recent = transactions.slice(0, 6)

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Resumo das suas finanças com dados reais do GraphQL.</p>
        </div>
        <div className="page-actions">
          <Link className="btn btn-secondary" to="/categories">
            Categorias
          </Link>
          <Link className="btn btn-primary" to="/transactions">
            Transações
          </Link>
        </div>
      </div>

      {loading ? <LoadingBlock /> : null}
      {error ? <Feedback tone="error">{error}</Feedback> : null}

      {!loading && !error ? (
        <>
          <div className="summary-grid">
            <article className="summary-card">
              <p className="eyebrow">Saldo</p>
              <p className="summary-value">{centsToDisplay(summary.balanceCents)}</p>
            </article>
            <article className="summary-card income">
              <p className="eyebrow">Receitas</p>
              <p className="summary-value">{centsToDisplay(summary.incomeCents)}</p>
            </article>
            <article className="summary-card expense">
              <p className="eyebrow">Despesas</p>
              <p className="summary-value">{centsToDisplay(summary.expenseCents)}</p>
            </article>
          </div>

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
                        {item.category.name} ·{' '}
                        {new Date(item.date).toLocaleDateString('pt-BR')}
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
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </section>
  )
}
