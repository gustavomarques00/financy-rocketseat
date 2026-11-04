export type GraphQLResponse<T> = {
  data?: T
  errors?: Array<{
    message: string
    extensions?: {
      code?: string
    }
  }>
}

export async function graphqlRequest<T>(
  url: string,
  query: string,
  variables?: Record<string, unknown>,
  token?: string,
): Promise<GraphQLResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  })

  return (await response.json()) as GraphQLResponse<T>
}
