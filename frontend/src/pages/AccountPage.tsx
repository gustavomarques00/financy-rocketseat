import { useAuth } from '../auth/useAuth'
import { Button } from '../components/ui/Button'
import { Field, TextInput } from '../components/ui/Field'
import { Icon } from '../components/ui/Icon'
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
        <hr className="profile-rule" />
        <div className="profile-fields">
          <Field label="Nome completo" htmlFor="account-name">
            <span className="input-shell">
              <Icon name="user" />
              <TextInput id="account-name" value={name} readOnly />
            </span>
          </Field>
          <Field label="E-mail" htmlFor="account-email">
            <span className="input-shell">
              <Icon name="mail" />
              <TextInput id="account-email" type="email" value={email} readOnly />
            </span>
            <p className="field-hint">O e-mail não pode ser alterado</p>
          </Field>
        </div>
        <Button variant="secondary" className="btn-logout" onClick={logout}>
          <Icon name="log-out" />
          Sair da conta
        </Button>
      </div>
    </section>
  )
}
