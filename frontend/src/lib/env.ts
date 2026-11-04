export function getBackendUrl(): string {
  const value = import.meta.env.VITE_BACKEND_URL?.trim()

  if (!value) {
    throw new Error(
      'VITE_BACKEND_URL is not configured. Copy frontend/.env.example to frontend/.env and set the GraphQL endpoint.',
    )
  }

  return value.replace(/\/$/, '')
}
