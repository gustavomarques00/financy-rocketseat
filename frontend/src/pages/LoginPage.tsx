import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../auth/useAuth'
import { Logo } from '../components/ui/Logo'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { Feedback } from '../components/ui/Feedback'
import { Field, TextInput } from '../components/ui/Field'
import { getErrorMessage } from '../lib/graphql/errors'

const schema = z.object({
  email: z.string().trim().email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe a senha.'),
  rememberMe: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Logo />
        <h1>Fazer login</h1>
        <p className="muted">Entre na sua conta para continuar</p>
        <form
          className="form-stack"
          onSubmit={handleSubmit(async (values) => {
            setError(null)
            try {
              await login({
                email: values.email,
                password: values.password,
                rememberMe: values.rememberMe === true,
              })
              navigate('/', { replace: true })
            } catch (err) {
              setError(getErrorMessage(err, 'Não foi possível entrar.'))
            }
          })}
        >
          <Field label="E-mail" htmlFor="login-email" error={errors.email?.message}>
            <span className="input-shell">
              <Icon name="mail" />
              <TextInput
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="mail@exemplo.com"
                {...register('email')}
              />
            </span>
          </Field>
          <Field label="Senha" htmlFor="login-password" error={errors.password?.message}>
            <span className="input-shell has-trailing">
              <Icon name="lock" />
              <TextInput
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Digite sua senha"
                {...register('password')}
              />
              <button
                type="button"
                className="input-toggle"
                aria-label={showPassword ? 'Ocultar caracteres' : 'Exibir caracteres'}
                onClick={() => setShowPassword((current) => !current)}
              >
                <Icon name={showPassword ? 'eye-off' : 'eye'} />
              </button>
            </span>
          </Field>
          <div className="auth-row">
            <label className="check-row">
              <input type="checkbox" {...register('rememberMe')} />
              Lembrar-me
            </label>
            <Link className="text-link" to="/forgot-password">
              Recuperar senha
            </Link>
          </div>
          {error ? <Feedback tone="error">{error}</Feedback> : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
        <div className="auth-divider">ou</div>
        <p className="auth-switch">Ainda não tem uma conta?</p>
        <Link className="btn btn-secondary" to="/register">
          <Icon name="user-plus" />
          Criar conta
        </Link>
      </div>
    </div>
  )
}
