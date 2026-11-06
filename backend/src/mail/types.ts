export type OutboundEmail = {
  to: string
  subject: string
  text: string
}

export type MailTransport = {
  send(message: OutboundEmail): Promise<void>
}
