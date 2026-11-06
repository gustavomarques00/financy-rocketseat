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
  name: z.string().trim().min(2, 'Informe seu nome.').max(80),
  email: z.string().trim().email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.').max(72),
})

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  })

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Logo />
        <h1>Criar conta</h1>
        <p className="muted">Comece a controlar suas finanças ainda hoje</p>
        <form
          className="form-stack"
          onSubmit={handleSubmit(async (values) => {
            setError(null)
            try {
              await registerUser(values)
              navigate('/', { replace: true })
            } catch (err) {
              setError(getErrorMessage(err, 'Não foi possível criar a conta.'))
            }
          })}
        >
          <Field label="Nome completo" htmlFor="register-name" error={errors.name?.message}>
            <span className="input-shell">
              <Icon name="user" />
              <TextInput
                id="register-name"
                autoComplete="name"
                placeholder="Seu nome completo"
                {...register('name')}
              />
            </span>
          </Field>
          <Field label="E-mail" htmlFor="register-email" error={errors.email?.message}>
            <span className="input-shell">
              <Icon name="mail" />
              <TextInput
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="mail@exemplo.com"
                {...register('email')}
              />
            </span>
          </Field>
          <Field label="Senha" htmlFor="register-password" error={errors.password?.message}>
            <span className="input-shell has-trailing">
              <Icon name="lock" />
              <TextInput
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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
          <p className="field-hint">A senha deve ter no mínimo 8 caracteres</p>
          {error ? <Feedback tone="error">{error}</Feedback> : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Criando…' : 'Cadastrar'}
          </Button>
        </form>
        <div className="auth-divider">ou</div>
        <p className="auth-switch">Já tem uma conta?</p>
        <Link className="btn btn-secondary" to="/login">
          <Icon name="log-in" />
          Fazer login
        </Link>
      </div>
    </div>
  )
}
