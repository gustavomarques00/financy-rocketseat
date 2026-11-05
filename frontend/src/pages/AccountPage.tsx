import { useAuth } from '../auth/useAuth'
import { Button } from '../components/ui/Button'
import { initials } from '../lib/categoryTone'

export function AccountPage() {
  const { user, logout } = useAuth()

  return (
    <section className="page-section profile-page">
      <h1 className="sr-only">Conta</h1>
      <div className="profile-card">
        <div className="avatar-link avatar-large" aria-hidden="true">
          {initials(user?.name ?? '')}
        </div>
        <h2>{user?.name}</h2>
        <p className="muted">{user?.email}</p>
        <label className="field" htmlFor="profile-name">
          <span className="field-label">Nome completo</span>
          <input id="profile-name" className="field-control" value={user?.name ?? ''} readOnly />
        </label>
        <label className="field" htmlFor="profile-email">
          <span className="field-label">E-mail</span>
          <input id="profile-email" className="field-control" value={user?.email ?? ''} disabled />
        </label>
        <p className="field-hint">O e-mail não pode ser alterado</p>
        <Button type="button" disabled>
          Salvar alterações
        </Button>
        <Button variant="secondary" onClick={logout}>
          Sair da conta
        </Button>
      </div>
    </section>
  )
}
