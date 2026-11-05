import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { LoadingBlock } from '../components/ui/Feedback'

export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'bootstrapping') {
    return <LoadingBlock label="Verificando sessão…" />
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { status } = useAuth()

  if (status === 'bootstrapping') {
    return <LoadingBlock label="Verificando sessão…" />
  }

  if (status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
