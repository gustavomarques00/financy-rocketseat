import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Env } from '../env.js'
import type { MailTransport, OutboundEmail } from './types.js'

export class MemoryMailTransport implements MailTransport {
  readonly messages: OutboundEmail[] = []

  async send(message: OutboundEmail): Promise<void> {
    this.messages.push({ ...message })
  }

  clear(): void {
    this.messages.length = 0
  }
}

export class FileMailTransport implements MailTransport {
  constructor(private readonly directory: string) {}

  async send(message: OutboundEmail): Promise<void> {
    await mkdir(this.directory, { recursive: true })
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const safeTo = message.to.replace(/[^a-zA-Z0-9._@-]/g, '_')
    const filePath = join(this.directory, `${stamp}-${safeTo}.txt`)
    const body = [
      `To: ${message.to}`,
      `Subject: ${message.subject}`,
      '',
      message.text,
      '',
    ].join('\n')
    await writeFile(filePath, body, 'utf8')
  }
}

export class SmtpMailTransport implements MailTransport {
  constructor(private readonly env: Env) {}

  async send(message: OutboundEmail): Promise<void> {
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.createTransport({
      host: this.env.SMTP_HOST,
      port: this.env.SMTP_PORT,
      secure: this.env.SMTP_SECURE,
      auth:
        this.env.SMTP_USER && this.env.SMTP_PASS
          ? {
              user: this.env.SMTP_USER,
              pass: this.env.SMTP_PASS,
            }
          : undefined,
    })

    await transporter.sendMail({
      from: this.env.MAIL_FROM,
      to: message.to,
      subject: message.subject,
      text: message.text,
    })
  }
}

export function createMailTransport(env: Env, memory?: MemoryMailTransport): MailTransport {
  if (memory) {
    return memory
  }

  switch (env.MAIL_TRANSPORT) {
    case 'smtp':
      return new SmtpMailTransport(env)
    case 'memory':
      return new MemoryMailTransport()
    case 'file':
    default:
      return new FileMailTransport(env.MAIL_DIR)
  }
}
