import { GraphQLClient, gql } from 'graphql-request'
import { getBackendUrl } from './env'

export type HealthPayload = {
  status: string
  service: string
  timestamp: string
  database: string
}

type HealthResponse = {
  health: HealthPayload
}

const HEALTH_QUERY = gql`
  query HealthCheck {
    health {
      status
      service
      timestamp
      database
    }
  }
`

export function createGraphqlClient(endpoint = getBackendUrl()): GraphQLClient {
  return new GraphQLClient(endpoint, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function fetchHealth(
  client: GraphQLClient = createGraphqlClient(),
): Promise<HealthPayload> {
  const data = await client.request<HealthResponse>(HEALTH_QUERY)
  return data.health
}
