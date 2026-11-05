import type { ReactNode } from 'react'

type FeedbackProps = {
  tone?: 'error' | 'success' | 'info'
  children: ReactNode
}

export function Feedback({ tone = 'info', children }: FeedbackProps) {
  return (
    <div className={`feedback feedback-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

export function LoadingBlock({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="loading-block" aria-busy="true" aria-live="polite">
      {label}
    </div>
  )
}
