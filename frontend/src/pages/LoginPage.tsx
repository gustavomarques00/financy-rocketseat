import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../auth/useAuth'
import { Button } from '../components/ui/Button'
import { Feedback } from '../components/ui/Feedback'
import { Field, TextInput } from '../components/ui/Field'
import { getErrorMessage } from '../lib/graphql/errors'

const schema = z.object({
  email: z.string().trim().email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe a senha.'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="brand">Financy</p>
        <h1>Entrar</h1>
        <p className="muted">Acesse sua organização financeira.</p>
        <form
          className="form-stack"
          onSubmit={handleSubmit(async (values) => {
            setError(null)
            try {
              await login(values)
              navigate('/', { replace: true })
            } catch (err) {
              setError(getErrorMessage(err, 'Não foi possível entrar.'))
            }
          })}
        >
          <Field label="E-mail" htmlFor="login-email" error={errors.email?.message}>
            <TextInput id="login-email" type="email" autoComplete="email" {...register('email')} />
          </Field>
          <Field label="Senha" htmlFor="login-password" error={errors.password?.message}>
            <TextInput
              id="login-password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
          </Field>
          {error ? <Feedback tone="error">{error}</Feedback> : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
        <p className="auth-switch">
          Não tem conta? <Link to="/register">Criar cadastro</Link>
        </p>
      </div>
    </div>
  )
}
