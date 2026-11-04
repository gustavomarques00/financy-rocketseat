import { useEffect, useState } from 'react'
import { fetchHealth, type HealthPayload } from '../lib/graphql'

type RequestState =
  | { status: 'loading' }
  | { status: 'success'; data: HealthPayload }
  | { status: 'error'; message: string }

function resolveErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Não foi possível consultar o backend GraphQL.'
}

export function HealthStatus() {
  const [state, setState] = useState<RequestState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function load() {
      setState({ status: 'loading' })

      try {
        const data = await fetchHealth()
        if (!cancelled) {
          setState({ status: 'success', data })
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: resolveErrorMessage(error) })
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  if (state.status === 'loading') {
    return (
      <section className="panel" aria-busy="true" aria-live="polite">
        <p className="eyebrow">Diagnóstico</p>
        <h2>Conectando ao GraphQL…</h2>
        <p className="muted">Consultando a query `health` no backend local.</p>
      </section>
    )
  }

  if (state.status === 'error') {
    return (
      <section className="panel panel-error" role="alert">
        <p className="eyebrow">Diagnóstico</p>
        <h2>Falha na integração</h2>
        <p className="muted">{state.message}</p>
        <p className="hint">
          Confirme se o backend está em execução e se `VITE_BACKEND_URL` aponta para o endpoint
          GraphQL.
        </p>
      </section>
    )
  }

  const { data } = state

  return (
    <section className="panel panel-success" aria-live="polite">
      <p className="eyebrow">Diagnóstico</p>
      <h2>Backend GraphQL operacional</h2>
      <dl className="meta-grid">
        <div>
          <dt>Status</dt>
          <dd>{data.status}</dd>
        </div>
        <div>
          <dt>Serviço</dt>
          <dd>{data.service}</dd>
        </div>
        <div>
          <dt>Database</dt>
          <dd>{data.database}</dd>
        </div>
        <div>
          <dt>Timestamp</dt>
          <dd>{new Date(data.timestamp).toLocaleString('pt-BR')}</dd>
        </div>
      </dl>
    </section>
  )
}
