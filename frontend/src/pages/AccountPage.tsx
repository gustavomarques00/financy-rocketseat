import { useAuth } from '../auth/useAuth'
import { Button } from '../components/ui/Button'
import { initials } from '../lib/categoryTone'

export function AccountPage() {
  const { user, logout } = useAuth()
  const name = user?.name ?? ''
  const email = user?.email ?? ''

  return (
    <section className="page-section profile-page">
      <h1 className="sr-only">Conta</h1>
      <div className="profile-card">
        <div className="avatar-link avatar-large" aria-hidden="true">
          {initials(name)}
        </div>
        <h2>{name}</h2>
        <p className="muted">{email}</p>
        <dl className="profile-details">
          <div>
            <dt>Nome completo</dt>
            <dd>{name}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{email}</dd>
          </div>
        </dl>
        <p className="field-hint">Estes dados são apresentados apenas para consulta nesta versão.</p>
        <Button variant="secondary" onClick={logout}>
          Sair da conta
        </Button>
      </div>
    </section>
  )
}
