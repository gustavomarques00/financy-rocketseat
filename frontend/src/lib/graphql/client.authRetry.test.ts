import { ClientError } from 'graphql-request'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { bindSessionBridge, unbindSessionBridge } from '../../auth/sessionBridge'

const requestMock = vi.fn()

vi.mock('graphql-request', async () => {
  const actual = await vi.importActual<typeof import('graphql-request')>('graphql-request')
  return {
    ...actual,
    GraphQLClient: class {
      request = requestMock
    },
  }
})

vi.mock('../env', () => ({
  getBackendUrl: () => 'http://127.0.0.1/graphql',
}))

describe('authenticated GraphQL retry', () => {
  beforeEach(() => {
    requestMock.mockReset()
    unbindSessionBridge()
  })

  it('refreshes once and retries a query after GraphQL UNAUTHENTICATED', async () => {
    const refreshAccessToken = vi.fn().mockResolvedValue('token-2')
    const onAccessToken = vi.fn()
    const onSessionInvalid = vi.fn()

    bindSessionBridge({
      getAccessToken: () => 'token-1',
      refreshAccessToken,
      onAccessToken,
      onSessionInvalid,
      getSessionGeneration: () => 1,
      isRestoreSuppressed: () => false,
    })

    requestMock
      .mockRejectedValueOnce(
        new ClientError(
          {
            data: null,
            errors: [
              {
                message: 'Authentication required.',
                extensions: { code: 'UNAUTHENTICATED' },
              },
            ],
            status: 200,
            headers: new Headers(),
          } as never,
          { query: 'query { me { id } }' },
        ),
      )
      .mockResolvedValueOnce({ me: { id: '1', email: 'a@b.com' } })

    const { api } = await import('./client')
    const me = await api.me('token-1')

    expect(me.id).toBe('1')
    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
    expect(onAccessToken).toHaveBeenCalledWith('token-2')
    expect(requestMock).toHaveBeenCalledTimes(2)
    expect(onSessionInvalid).not.toHaveBeenCalled()
  })

  it('does not retry on network failures', async () => {
    const refreshAccessToken = vi.fn()
    bindSessionBridge({
      getAccessToken: () => 'token-1',
      refreshAccessToken,
      onAccessToken: vi.fn(),
      onSessionInvalid: vi.fn(),
      getSessionGeneration: () => 1,
      isRestoreSuppressed: () => false,
    })

    requestMock.mockRejectedValueOnce(new Error('Failed to fetch'))

    const { api } = await import('./client')
    await expect(api.categories('token-1')).rejects.toMatchObject({ code: 'UNKNOWN' })
    expect(refreshAccessToken).not.toHaveBeenCalled()
    expect(requestMock).toHaveBeenCalledTimes(1)
  })

  it('shares a single refresh across concurrent UNAUTHENTICATED calls', async () => {
    let resolveRefresh: ((token: string | null) => void) | undefined
    let inFlight: Promise<string | null> | null = null
    const refreshAccessToken = vi.fn(() => {
      if (!inFlight) {
        inFlight = new Promise<string | null>((resolve) => {
          resolveRefresh = resolve
        }).finally(() => {
          inFlight = null
        })
      }
      return inFlight
    })

    bindSessionBridge({
      getAccessToken: () => 'token-1',
      refreshAccessToken,
      onAccessToken: vi.fn(),
      onSessionInvalid: vi.fn(),
      getSessionGeneration: () => 1,
      isRestoreSuppressed: () => false,
    })

    const unauthenticated = new ClientError(
      {
        data: null,
        errors: [
          {
            message: 'Authentication required.',
            extensions: { code: 'UNAUTHENTICATED' },
          },
        ],
        status: 200,
        headers: new Headers(),
      } as never,
      { query: 'query' },
    )

    requestMock
      .mockRejectedValueOnce(unauthenticated)
      .mockRejectedValueOnce(unauthenticated)
      .mockResolvedValueOnce({ categories: [] })
      .mockResolvedValueOnce({ transactions: [] })

    const { api } = await import('./client')
    const pending = Promise.all([api.categories('token-1'), api.transactions('token-1')])

    await vi.waitFor(() => {
      expect(refreshAccessToken).toHaveBeenCalled()
      expect(resolveRefresh).toBeTypeOf('function')
    })

    resolveRefresh?.('token-2')
    await pending

    expect(refreshAccessToken).toHaveBeenCalledTimes(2)
    expect(requestMock).toHaveBeenCalledTimes(4)
  })
})

