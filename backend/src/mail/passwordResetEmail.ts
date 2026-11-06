import type { Env } from '../env.js'
import type { MailTransport } from './types.js'

export async function sendPasswordResetEmail(
  transport: MailTransport,
  env: Env,
  input: { to: string; resetToken: string },
): Promise<void> {
  const base = env.FRONTEND_URL.replace(/\/$/, '')
  const resetUrl = `${base}/reset-password?token=${encodeURIComponent(input.resetToken)}`

  await transport.send({
    to: input.to,
    subject: 'Financy — redefinição de senha',
    text: [
      'Você solicitou a redefinição de senha da sua conta Financy.',
      '',
      'Abra o link abaixo em até 30 minutos para escolher uma nova senha:',
      resetUrl,
      '',
      'Se você não fez esta solicitação, ignore este e-mail.',
      'O link é de uso único e expira automaticamente.',
    ].join('\n'),
  })
}
