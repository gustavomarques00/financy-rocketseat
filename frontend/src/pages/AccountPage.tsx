import { useAuth } from '../auth/useAuth'
import { Button } from '../components/ui/Button'

export function AccountPage() {
  const { user, logout } = useAuth()

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h1>Conta</h1>
          <p className="muted">Dados do usuário autenticado via query `me`.</p>
        </div>
      </div>

      <div className="panel account-panel">
        <dl className="meta-grid">
          <div>
            <dt>Nome</dt>
            <dd>{user?.name}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>Criado em</dt>
            <dd>
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleString('pt-BR')
                : '—'}
            </dd>
          </div>
        </dl>
        <Button variant="secondary" onClick={logout}>
          Encerrar sessão
        </Button>
      </div>
    </section>
  )
}
