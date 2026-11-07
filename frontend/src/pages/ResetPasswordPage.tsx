import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Logo } from '../components/ui/Logo'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { Feedback } from '../components/ui/Feedback'
import { Field, TextInput } from '../components/ui/Field'
import { api } from '../lib/graphql/client'
import { getErrorMessage } from '../lib/graphql/errors'

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres.')
      .max(72, 'A senha deve ter no máximo 72 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [token] = useState(() => searchParams.get('token')?.trim() ?? '')
  const [error, setError] = useState<string | null>(
    token ? null : 'Link de redefinição inválido ou incompleto.',
  )
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Logo />
        <h1>Redefinir senha</h1>
        <p className="muted">Escolha uma nova senha para a sua conta</p>
        <form
          className="form-stack"
          onSubmit={handleSubmit(async (values) => {
            if (!token) {
              setError('Link de redefinição inválido ou incompleto.')
              return
            }
            setError(null)
            setSuccess(null)
            try {
              await api.resetPassword(token, values.password)
              setSuccess('Senha atualizada. Você já pode entrar com a nova senha.')
              window.setTimeout(() => {
                navigate('/login', { replace: true })
              }, 1200)
            } catch (err) {
              setError(getErrorMessage(err, 'Não foi possível redefinir a senha.'))
            }
          })}
        >
          <Field label="Nova senha" htmlFor="reset-password" error={errors.password?.message}>
            <span className="input-shell has-trailing">
              <Icon name="lock" />
              <TextInput
                id="reset-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Digite a nova senha"
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
          <Field
            label="Confirmar senha"
            htmlFor="reset-confirm"
            error={errors.confirmPassword?.message}
          >
            <span className="input-shell">
              <Icon name="lock" />
              <TextInput
                id="reset-confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repita a nova senha"
                {...register('confirmPassword')}
              />
            </span>
          </Field>
          {error ? <Feedback tone="error">{error}</Feedback> : null}
          {success ? <Feedback tone="success">{success}</Feedback> : null}
          <Button type="submit" disabled={isSubmitting || !token}>
            {isSubmitting ? 'Salvando…' : 'Confirmar nova senha'}
          </Button>
        </form>
        <Link className="text-link auth-back" to="/login">
          Voltar ao login
        </Link>
      </div>
    </div>
  )
}
