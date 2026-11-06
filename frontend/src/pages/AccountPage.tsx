import { useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { Button } from '../components/ui/Button'
import { Feedback } from '../components/ui/Feedback'
import { Field, TextInput } from '../components/ui/Field'
import { Icon } from '../components/ui/Icon'
import { getErrorMessage } from '../lib/graphql/errors'
import { initials } from '../lib/categoryTone'

export function AccountPage() {
  const { user, logout, updateProfile } = useAuth()
  const name = user?.name ?? ''
  const email = user?.email ?? ''
  const [draft, setDraft] = useState(name)
  const [savedName, setSavedName] = useState(name)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (name !== savedName) {
    setSavedName(name)
    setDraft(name)
  }

  const trimmed = draft.trim()
  const dirty = trimmed !== name

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
        <form
          className="profile-fields"
          onSubmit={async (event) => {
            event.preventDefault()
            if (!dirty || submitting) {
              return
            }
            setSubmitting(true)
            setError(null)
            setSuccess(null)
            try {
              await updateProfile(trimmed)
              setSuccess('Alterações salvas.')
            } catch (err) {
              setError(getErrorMessage(err, 'Não foi possível salvar o nome.'))
            } finally {
              setSubmitting(false)
            }
          }}
        >
          <Field label="Nome completo" htmlFor="account-name">
            <span className="input-shell">
              <Icon name="user" />
              <TextInput
                id="account-name"
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value)
                  setSuccess(null)
                }}
              />
            </span>
          </Field>
          <Field label="E-mail" htmlFor="account-email">
            <span className="input-shell">
              <Icon name="mail" />
              <TextInput id="account-email" type="email" value={email} readOnly />
            </span>
            <p className="field-hint">O e-mail não pode ser alterado</p>
          </Field>
          {error ? <Feedback tone="error">{error}</Feedback> : null}
          {success ? <Feedback tone="success">{success}</Feedback> : null}
          <Button type="submit" disabled={!dirty || trimmed.length < 2 || submitting}>
            {submitting ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </form>
        <Button variant="secondary" className="btn-logout" onClick={logout}>
          <Icon name="log-out" />
          Sair da conta
        </Button>
      </div>
    </section>
  )
}
