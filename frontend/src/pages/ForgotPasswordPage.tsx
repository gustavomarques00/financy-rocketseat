import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Logo } from '../components/ui/Logo'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { Feedback } from '../components/ui/Feedback'
import { Field, TextInput } from '../components/ui/Field'
import { api } from '../lib/graphql/client'
import { getErrorMessage } from '../lib/graphql/errors'

const schema = z.object({
  email: z.string().trim().email('Informe um e-mail válido.'),
})

type FormValues = z.infer<typeof schema>

const GENERIC_SUCCESS =
  'Se existir uma conta para este e-mail, enviamos um link de redefinição.'

export function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Logo />
        <h1>Recuperar senha</h1>
        <p className="muted">Informe o e-mail da sua conta para receber o link</p>
        <form
          className="form-stack"
          onSubmit={handleSubmit(async (values) => {
            setError(null)
            setSuccess(null)
            try {
              await api.requestPasswordReset(values.email)
              setSuccess(GENERIC_SUCCESS)
            } catch (err) {
              setError(getErrorMessage(err, 'Não foi possível enviar o link.'))
            }
          })}
        >
          <Field label="E-mail" htmlFor="forgot-email" error={errors.email?.message}>
            <span className="input-shell">
              <Icon name="mail" />
              <TextInput
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="mail@exemplo.com"
                {...register('email')}
              />
            </span>
          </Field>
          {error ? <Feedback tone="error">{error}</Feedback> : null}
          {success ? <Feedback tone="success">{success}</Feedback> : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando…' : 'Enviar link'}
          </Button>
        </form>
        <Link className="text-link auth-back" to="/login">
          Voltar ao login
        </Link>
      </div>
    </div>
  )
}
