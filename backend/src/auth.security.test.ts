import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { hashToken } from './auth/tokens.js'
import { graphqlRequest } from './test/graphql-client.js'
import { startTestApp, type TestApp } from './test/test-app.js'
import { verifyPassword } from './auth/password.js'

const REGISTER = /* GraphQL */ `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user { id email }
    }
  }
`

const LOGIN = /* GraphQL */ `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user { id email }
    }
  }
`

const ME = /* GraphQL */ `
  query Me { me { id email } }
`

const REQUEST_RESET = /* GraphQL */ `
  mutation RequestReset($email: String!) {
    requestPasswordReset(email: $email) { message }
  }
`

const RESET_PASSWORD = /* GraphQL */ `
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) { message }
  }
`

function extractResetToken(mailText: string): string {
  const match = mailText.match(/token=([A-Za-z0-9_-]+)/)
  if (!match?.[1]) {
    throw new Error('Reset token not found in mail')
  }
  return match[1]
}

function parseSetCookie(header: string | null): string | null {
  if (!header) return null
  const part = header.split(';')[0]
  return part ?? null
}

describe('auth security: password reset and remember-me', () => {
  let app: TestApp

  beforeAll(async () => {
    app = await startTestApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('returns indistinguishable messages for existing and missing emails', async () => {
    await graphqlRequest(app.url, REGISTER, {
      input: {
        name: 'Reset User',
        email: 'reset-user@example.com',
        password: 'password123',
      },
    })

    const existing = await graphqlRequest<{ requestPasswordReset: { message: string } }>(
      app.url,
      REQUEST_RESET,
      { email: 'reset-user@example.com' },
    )
    const missing = await graphqlRequest<{ requestPasswordReset: { message: string } }>(
      app.url,
      REQUEST_RESET,
      { email: 'missing-user@example.com' },
    )

    expect(existing.errors).toBeUndefined()
    expect(missing.errors).toBeUndefined()
    expect(existing.data?.requestPasswordReset.message).toBe(
      missing.data?.requestPasswordReset.message,
    )
    expect(JSON.stringify(existing.data)).not.toMatch(/token=/i)
  })

  it('resets password once, rejects reuse, and revokes old access tokens', async () => {
    const registered = await graphqlRequest<{
      register: { token: string; user: { id: string } }
    }>(app.url, REGISTER, {
      input: {
        name: 'Rotate User',
        email: 'rotate-user@example.com',
        password: 'password123',
      },
    })
    const oldToken = registered.data!.register.token

    await graphqlRequest(app.url, REQUEST_RESET, { email: 'rotate-user@example.com' })
    expect(app.mail.messages.length).toBeGreaterThan(0)
    const rawToken = extractResetToken(app.mail.messages.at(-1)!.text)

    const stored = await app.prisma.passwordResetToken.findFirst({
      where: { tokenHash: hashToken(rawToken) },
    })
    expect(stored).toBeTruthy()
    expect(stored?.tokenHash).not.toBe(rawToken)

    const reset = await graphqlRequest<{ resetPassword: { message: string } }>(
      app.url,
      RESET_PASSWORD,
      { token: rawToken, newPassword: 'newpassword123' },
    )
    expect(reset.errors).toBeUndefined()

    const reuse = await graphqlRequest(app.url, RESET_PASSWORD, {
      token: rawToken,
      newPassword: 'anotherpassword1',
    })
    expect(reuse.errors?.[0]?.message).toMatch(/invalid or expired/i)

    const oldLogin = await graphqlRequest(app.url, LOGIN, {
      input: { email: 'rotate-user@example.com', password: 'password123' },
    })
    expect(oldLogin.errors?.[0]?.message).toMatch(/invalid email or password/i)

    const meOld = await graphqlRequest(app.url, ME, undefined, oldToken)
    expect(meOld.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')

    const newLogin = await graphqlRequest<{ login: { token: string } }>(app.url, LOGIN, {
      input: { email: 'rotate-user@example.com', password: 'newpassword123' },
    })
    expect(newLogin.errors).toBeUndefined()
    expect(newLogin.data?.login.token).toBeTruthy()

    const user = await app.prisma.user.findUniqueOrThrow({
      where: { email: 'rotate-user@example.com' },
    })
    expect(await verifyPassword('newpassword123', user.passwordHash)).toBe(true)
    expect(user.sessionVersion).toBeGreaterThan(0)
  })

  it('invalidates previous reset tokens when a new request is issued', async () => {
    await graphqlRequest(app.url, REGISTER, {
      input: {
        name: 'Multi Reset',
        email: 'multi-reset@example.com',
        password: 'password123',
      },
    })

    await graphqlRequest(app.url, REQUEST_RESET, { email: 'multi-reset@example.com' })
    const firstToken = extractResetToken(app.mail.messages.at(-1)!.text)
    await graphqlRequest(app.url, REQUEST_RESET, { email: 'multi-reset@example.com' })
    const secondToken = extractResetToken(app.mail.messages.at(-1)!.text)
    expect(secondToken).not.toBe(firstToken)

    const firstAttempt = await graphqlRequest(app.url, RESET_PASSWORD, {
      token: firstToken,
      newPassword: 'password45678',
    })
    expect(firstAttempt.errors?.[0]?.message).toMatch(/invalid or expired/i)

    const secondAttempt = await graphqlRequest(app.url, RESET_PASSWORD, {
      token: secondToken,
      newPassword: 'password45678',
    })
    expect(secondAttempt.errors).toBeUndefined()
  })

  it('sets HttpOnly refresh cookie for remember-me and rotates on refresh', async () => {
    await graphqlRequest(app.url, REGISTER, {
      input: {
        name: 'Persist User',
        email: 'persist-user@example.com',
        password: 'password123',
      },
    })

    const loginResponse = await fetch(app.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:5173',
      },
      body: JSON.stringify({
        query: LOGIN,
        variables: {
          input: {
            email: 'persist-user@example.com',
            password: 'password123',
            rememberMe: true,
          },
        },
      }),
    })

    const setCookie = loginResponse.headers.getSetCookie?.() ?? []
    const refreshCookie = setCookie.find((value) => value.startsWith('financy_refresh='))
    expect(refreshCookie).toBeTruthy()
    expect(refreshCookie).toMatch(/HttpOnly/i)
    expect(refreshCookie).toMatch(/Path=\/auth/i)
    expect(refreshCookie).not.toMatch(/financy_refresh=;/i)

    const loginJson = (await loginResponse.json()) as {
      data: { login: { token: string } }
    }
    expect(loginJson.data.login.token).toBeTruthy()

    const cookiePair = parseSetCookie(refreshCookie!)!
    const refreshResponse = await fetch(`${app.origin}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:5173',
        'X-Financy-CSRF': '1',
        Cookie: cookiePair,
      },
    })
    expect(refreshResponse.status).toBe(200)
    const refreshJson = (await refreshResponse.json()) as { token: string }
    expect(refreshJson.token).toBeTruthy()

    const rotatedCookies = refreshResponse.headers.getSetCookie?.() ?? []
    expect(rotatedCookies.some((value) => value.startsWith('financy_refresh='))).toBe(true)

    const reuse = await fetch(`${app.origin}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:5173',
        'X-Financy-CSRF': '1',
        Cookie: cookiePair,
      },
    })
    expect(reuse.status).toBe(401)

    const logout = await fetch(`${app.origin}/auth/logout`, {
      method: 'POST',
      headers: {
        Origin: 'http://localhost:5173',
        'X-Financy-CSRF': '1',
        Cookie: parseSetCookie(rotatedCookies.find((v) => v.startsWith('financy_refresh='))!)!,
      },
    })
    expect(logout.status).toBe(204)

    const afterLogout = await fetch(`${app.origin}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:5173',
        'X-Financy-CSRF': '1',
        Cookie: parseSetCookie(rotatedCookies.find((v) => v.startsWith('financy_refresh='))!)!,
      },
    })
    expect(afterLogout.status).toBe(401)
  })

  it('does not set refresh cookie when rememberMe is false', async () => {
    const response = await fetch(app.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:5173',
      },
      body: JSON.stringify({
        query: LOGIN,
        variables: {
          input: {
            email: 'persist-user@example.com',
            password: 'password123',
            rememberMe: false,
          },
        },
      }),
    })
    const setCookie = response.headers.getSetCookie?.() ?? []
    expect(setCookie.some((value) => value.startsWith('financy_refresh='))).toBe(false)
  })

  it('rejects refresh without CSRF header', async () => {
    const response = await fetch(`${app.origin}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:5173',
      },
    })
    expect(response.status).toBe(403)
  })
})
