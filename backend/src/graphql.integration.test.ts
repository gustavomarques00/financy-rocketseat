import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import * as jose from 'jose'
import { graphqlRequest } from './test/graphql-client.js'
import { startTestApp, type TestApp } from './test/test-app.js'

type AuthPayload = {
  register?: {
    token: string
    user: { id: string; name: string; email: string }
  }
  login?: {
    token: string
    user: { id: string; name: string; email: string }
  }
}

type CategoryPayload = {
  createCategory?: { id: string; name: string }
  updateCategory?: { id: string; name: string }
  deleteCategory?: { id: string; name: string }
  categories?: Array<{ id: string; name: string }>
  category?: { id: string; name: string }
}

type TransactionPayload = {
  createTransaction?: {
    id: string
    description: string
    amount: number
    type: string
    categoryId: string
  }
  updateTransaction?: {
    id: string
    description: string
    amount: number
    categoryId: string
  }
  deleteTransaction?: { id: string }
  transactions?: Array<{ id: string; description: string; amount: number }>
  transaction?: { id: string; description: string }
}

const REGISTER = /* GraphQL */ `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

const LOGIN = /* GraphQL */ `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

const ME = /* GraphQL */ `
  query Me {
    me {
      id
      email
    }
  }
`

async function register(
  app: TestApp,
  input: { name: string; email: string; password: string },
) {
  return graphqlRequest<AuthPayload>(app.url, REGISTER, { input })
}

async function login(
  app: TestApp,
  input: { email: string; password: string },
) {
  return graphqlRequest<AuthPayload>(app.url, LOGIN, { input })
}

describe('GraphQL backend core', () => {
  let app: TestApp
  let userAToken: string
  let userAId: string
  let userBToken: string
  let categoryAId: string
  let categoryBId: string
  let transactionAId: string
  let transactionBId: string

  beforeAll(async () => {
    app = await startTestApp()

    const userA = await register(app, {
      name: 'User A',
      email: 'user.a@example.com',
      password: 'password-a-1',
    })
    const userB = await register(app, {
      name: 'User B',
      email: 'user.b@example.com',
      password: 'password-b-1',
    })

    userAToken = userA.data!.register!.token
    userAId = userA.data!.register!.user.id
    userBToken = userB.data!.register!.token

    const categoryA = await graphqlRequest<CategoryPayload>(
      app.url,
      /* GraphQL */ `
        mutation ($input: CreateCategoryInput!) {
          createCategory(input: $input) {
            id
            name
          }
        }
      `,
      { input: { name: 'Salary' } },
      userAToken,
    )
    const categoryB = await graphqlRequest<CategoryPayload>(
      app.url,
      /* GraphQL */ `
        mutation ($input: CreateCategoryInput!) {
          createCategory(input: $input) {
            id
            name
          }
        }
      `,
      { input: { name: 'Rent' } },
      userBToken,
    )

    categoryAId = categoryA.data!.createCategory!.id
    categoryBId = categoryB.data!.createCategory!.id

    const txA = await graphqlRequest<TransactionPayload>(
      app.url,
      /* GraphQL */ `
        mutation ($input: CreateTransactionInput!) {
          createTransaction(input: $input) {
            id
            description
            amount
            type
            categoryId
          }
        }
      `,
      {
        input: {
          description: 'November salary',
          amount: 500000,
          type: 'INCOME',
          date: '2026-11-01T12:00:00.000Z',
          categoryId: categoryAId,
        },
      },
      userAToken,
    )
    const txB = await graphqlRequest<TransactionPayload>(
      app.url,
      /* GraphQL */ `
        mutation ($input: CreateTransactionInput!) {
          createTransaction(input: $input) {
            id
            description
            amount
            type
            categoryId
          }
        }
      `,
      {
        input: {
          description: 'Apartment rent',
          amount: 250000,
          type: 'EXPENSE',
          date: '2026-11-02T12:00:00.000Z',
          categoryId: categoryBId,
        },
      },
      userBToken,
    )

    transactionAId = txA.data!.createTransaction!.id
    transactionBId = txB.data!.createTransaction!.id
  }, 60_000)

  afterAll(async () => {
    if (app) {
      await app.close()
    }
  })

  describe('authentication', () => {
    it('registers a valid user without exposing password hash', async () => {
      const response = await register(app, {
        name: 'Valid User',
        email: 'Valid.User@Example.com',
        password: 'secure-pass-1',
      })

      expect(response.errors).toBeUndefined()
      expect(response.data?.register?.user.email).toBe('valid.user@example.com')
      expect(response.data?.register?.token).toBeTruthy()
      expect(JSON.stringify(response)).not.toMatch(/passwordHash|password/i)

      const stored = await app.prisma.user.findUnique({
        where: { email: 'valid.user@example.com' },
      })
      expect(stored?.passwordHash).toBeTruthy()
      expect(stored?.passwordHash).not.toBe('secure-pass-1')
    })

    it('rejects duplicate email', async () => {
      const response = await register(app, {
        name: 'Dup',
        email: 'user.a@example.com',
        password: 'password-a-1',
      })

      expect(response.data?.register).toBeUndefined()
      expect(response.errors?.[0]?.extensions?.code).toBe('CONFLICT')
    })

    it('rejects invalid email', async () => {
      const response = await register(app, {
        name: 'Bad Email',
        email: 'not-an-email',
        password: 'password-a-1',
      })

      expect(response.data?.register).toBeUndefined()
      expect(response.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
    })

    it('rejects invalid password on register', async () => {
      const response = await register(app, {
        name: 'Short Pass',
        email: 'short.pass@example.com',
        password: 'short',
      })

      expect(response.data?.register).toBeUndefined()
      expect(response.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
    })

    it('logs in with valid credentials', async () => {
      const response = await login(app, {
        email: 'user.a@example.com',
        password: 'password-a-1',
      })

      expect(response.errors).toBeUndefined()
      expect(response.data?.login?.user.id).toBe(userAId)
      expect(response.data?.login?.token).toBeTruthy()
    })

    it('rejects incorrect login without revealing account existence', async () => {
      const wrongPassword = await login(app, {
        email: 'user.a@example.com',
        password: 'wrong-password',
      })
      const unknownEmail = await login(app, {
        email: 'missing@example.com',
        password: 'wrong-password',
      })

      expect(wrongPassword.errors?.[0]?.message).toBe('Invalid email or password.')
      expect(unknownEmail.errors?.[0]?.message).toBe('Invalid email or password.')
      expect(wrongPassword.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
      expect(unknownEmail.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
    })

    it('rejects missing token on protected query', async () => {
      const response = await graphqlRequest<{ me: { id: string } }>(app.url, ME)
      expect(response.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
    })

    it('rejects invalid token on protected query', async () => {
      const response = await graphqlRequest<{ me: { id: string } }>(
        app.url,
        ME,
        undefined,
        'invalid.token.value',
      )
      expect(response.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
    })

    it('rejects expired token on protected query', async () => {
      const secret = new TextEncoder().encode(app.env.JWT_SECRET)
      const expiredToken = await new jose.SignJWT({})
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(userAId)
        .setIssuer('financy-backend')
        .setAudience('financy-frontend')
        .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
        .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
        .sign(secret)

      const response = await graphqlRequest<{ me: { id: string } }>(
        app.url,
        ME,
        undefined,
        expiredToken,
      )
      expect(response.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
    })
  })

  describe('categories', () => {
    it('lists only authenticated user categories', async () => {
      const response = await graphqlRequest<CategoryPayload>(
        app.url,
        /* GraphQL */ `
          query {
            categories {
              id
              name
            }
          }
        `,
        undefined,
        userAToken,
      )

      expect(response.errors).toBeUndefined()
      expect(response.data?.categories?.map((item) => item.id)).toContain(categoryAId)
      expect(response.data?.categories?.map((item) => item.id)).not.toContain(categoryBId)
    })

    it('updates own category', async () => {
      const response = await graphqlRequest<CategoryPayload>(
        app.url,
        /* GraphQL */ `
          mutation ($id: ID!, $input: UpdateCategoryInput!) {
            updateCategory(id: $id, input: $input) {
              id
              name
            }
          }
        `,
        { id: categoryAId, input: { name: 'Payroll' } },
        userAToken,
      )

      expect(response.errors).toBeUndefined()
      expect(response.data?.updateCategory?.name).toBe('Payroll')
    })

    it('returns not found for missing category', async () => {
      const response = await graphqlRequest<CategoryPayload>(
        app.url,
        /* GraphQL */ `
          query ($id: ID!) {
            category(id: $id) {
              id
            }
          }
        `,
        { id: 'missing-category-id' },
        userAToken,
      )

      expect(response.errors?.[0]?.extensions?.code).toBe('NOT_FOUND')
    })

    it('rejects category operations without login', async () => {
      const response = await graphqlRequest<CategoryPayload>(
        app.url,
        /* GraphQL */ `
          mutation ($input: CreateCategoryInput!) {
            createCategory(input: $input) {
              id
            }
          }
        `,
        { input: { name: 'Unauthorized' } },
      )

      expect(response.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
    })

    it('blocks deleting category still linked to transactions', async () => {
      const response = await graphqlRequest<CategoryPayload>(
        app.url,
        /* GraphQL */ `
          mutation ($id: ID!) {
            deleteCategory(id: $id) {
              id
            }
          }
        `,
        { id: categoryAId },
        userAToken,
      )

      expect(response.errors?.[0]?.extensions?.code).toBe('CATEGORY_IN_USE')
    })

    it('persists description, icon and color and rejects invalid appearance', async () => {
      const created = await graphqlRequest<{
        createCategory?: {
          id: string
          description: string | null
          icon: string
          color: string
        }
      }>(
        app.url,
        /* GraphQL */ `
          mutation ($input: CreateCategoryInput!) {
            createCategory(input: $input) {
              id
              description
              icon
              color
            }
          }
        `,
        {
          input: {
            name: 'Appearance',
            description: '  Contas da casa  ',
            icon: 'house',
            color: 'blue',
          },
        },
        userAToken,
      )

      expect(created.errors).toBeUndefined()
      expect(created.data?.createCategory).toMatchObject({
        description: 'Contas da casa',
        icon: 'house',
        color: 'blue',
      })

      const updated = await graphqlRequest<{
        updateCategory?: { description: string | null; icon: string; color: string }
      }>(
        app.url,
        /* GraphQL */ `
          mutation ($id: ID!, $input: UpdateCategoryInput!) {
            updateCategory(id: $id, input: $input) {
              description
              icon
              color
            }
          }
        `,
        {
          id: created.data!.createCategory!.id,
          input: { name: 'Appearance', description: null, icon: 'car', color: 'red' },
        },
        userAToken,
      )

      expect(updated.errors).toBeUndefined()
      expect(updated.data?.updateCategory).toEqual({
        description: null,
        icon: 'car',
        color: 'red',
      })

      const invalid = await graphqlRequest(
        app.url,
        /* GraphQL */ `
          mutation ($input: CreateCategoryInput!) {
            createCategory(input: $input) {
              id
            }
          }
        `,
        { input: { name: 'Bad appearance', icon: '<svg>', color: 'rgb(0,0,0)' } },
        userAToken,
      )

      expect(invalid.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')

      const omitted = await graphqlRequest<{
        createCategory?: { description: string | null; icon: string; color: string }
      }>(
        app.url,
        /* GraphQL */ `
          mutation ($input: CreateCategoryInput!) {
            createCategory(input: $input) {
              description
              icon
              color
            }
          }
        `,
        { input: { name: 'Defaults only' } },
        userAToken,
      )

      expect(omitted.errors).toBeUndefined()
      expect(omitted.data?.createCategory).toMatchObject({
        description: null,
        icon: 'tag',
        color: 'green',
      })
    })
  })

  describe('profile name', () => {
    it('updates only the authenticated user name', async () => {
      const updated = await graphqlRequest<{
        updateMe?: { id: string; name: string; email: string }
      }>(
        app.url,
        /* GraphQL */ `
          mutation ($input: UpdateMeInput!) {
            updateMe(input: $input) {
              id
              name
              email
            }
          }
        `,
        { input: { name: 'User A renamed' } },
        userAToken,
      )

      expect(updated.errors).toBeUndefined()
      expect(updated.data?.updateMe).toMatchObject({
        id: userAId,
        name: 'User A renamed',
      })
      expect(updated.data?.updateMe?.email).toContain('@example.com')

      const me = await graphqlRequest<{ me?: { name: string; email: string } }>(
        app.url,
        /* GraphQL */ `
          query {
            me {
              name
              email
            }
          }
        `,
        undefined,
        userAToken,
      )
      expect(me.data?.me?.name).toBe('User A renamed')
      expect(me.data?.me?.email).toBe(updated.data?.updateMe?.email)

      const other = await graphqlRequest<{ me?: { name: string } }>(
        app.url,
        /* GraphQL */ `
          query {
            me {
              name
            }
          }
        `,
        undefined,
        userBToken,
      )
      expect(other.data?.me?.name).not.toBe('User A renamed')
    })

    it('rejects anonymous and invalid profile updates', async () => {
      const anonymous = await graphqlRequest(
        app.url,
        /* GraphQL */ `
          mutation ($input: UpdateMeInput!) {
            updateMe(input: $input) {
              id
            }
          }
        `,
        { input: { name: 'Intruder' } },
      )
      expect(anonymous.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')

      const invalid = await graphqlRequest(
        app.url,
        /* GraphQL */ `
          mutation ($input: UpdateMeInput!) {
            updateMe(input: $input) {
              id
            }
          }
        `,
        { input: { name: 'A' } },
        userAToken,
      )
      expect(invalid.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
    })
  })

  describe('transactions', () => {
    it('lists only authenticated user transactions', async () => {
      const response = await graphqlRequest<TransactionPayload>(
        app.url,
        /* GraphQL */ `
          query {
            transactions {
              id
              description
              amount
            }
          }
        `,
        undefined,
        userAToken,
      )

      expect(response.errors).toBeUndefined()
      expect(response.data?.transactions?.map((item) => item.id)).toContain(transactionAId)
      expect(response.data?.transactions?.map((item) => item.id)).not.toContain(transactionBId)
    })

    it('updates own transaction', async () => {
      const response = await graphqlRequest<TransactionPayload>(
        app.url,
        /* GraphQL */ `
          mutation ($id: ID!, $input: UpdateTransactionInput!) {
            updateTransaction(id: $id, input: $input) {
              id
              description
              amount
            }
          }
        `,
        {
          id: transactionAId,
          input: { description: 'Updated salary', amount: 510000 },
        },
        userAToken,
      )

      expect(response.errors).toBeUndefined()
      expect(response.data?.updateTransaction?.description).toBe('Updated salary')
      expect(response.data?.updateTransaction?.amount).toBe(510000)
    })

    it('rejects invalid amount', async () => {
      const response = await graphqlRequest<TransactionPayload>(
        app.url,
        /* GraphQL */ `
          mutation ($input: CreateTransactionInput!) {
            createTransaction(input: $input) {
              id
            }
          }
        `,
        {
          input: {
            description: 'Invalid amount',
            amount: 0,
            type: 'EXPENSE',
            date: '2026-11-03T12:00:00.000Z',
            categoryId: categoryAId,
          },
        },
        userAToken,
      )

      expect(response.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
    })

    it('rejects invalid category for create', async () => {
      const response = await graphqlRequest<TransactionPayload>(
        app.url,
        /* GraphQL */ `
          mutation ($input: CreateTransactionInput!) {
            createTransaction(input: $input) {
              id
            }
          }
        `,
        {
          input: {
            description: 'Missing category',
            amount: 1000,
            type: 'EXPENSE',
            date: '2026-11-03T12:00:00.000Z',
            categoryId: 'missing-category-id',
          },
        },
        userAToken,
      )

      expect(response.errors?.[0]?.extensions?.code).toBe('NOT_FOUND')
    })

    it('rejects transaction operations without login', async () => {
      const response = await graphqlRequest<TransactionPayload>(
        app.url,
        /* GraphQL */ `
          query {
            transactions {
              id
            }
          }
        `,
      )

      expect(response.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
    })
  })

  describe('user isolation', () => {
    it('prevents A from reading B categories and transactions', async () => {
      const category = await graphqlRequest<CategoryPayload>(
        app.url,
        /* GraphQL */ `
          query ($id: ID!) {
            category(id: $id) {
              id
            }
          }
        `,
        { id: categoryBId },
        userAToken,
      )
      const transaction = await graphqlRequest<TransactionPayload>(
        app.url,
        /* GraphQL */ `
          query ($id: ID!) {
            transaction(id: $id) {
              id
            }
          }
        `,
        { id: transactionBId },
        userAToken,
      )

      expect(category.errors?.[0]?.extensions?.code).toBe('NOT_FOUND')
      expect(transaction.errors?.[0]?.extensions?.code).toBe('NOT_FOUND')
    })

    it('prevents A from updating or deleting B resources', async () => {
      const updateCategoryResponse = await graphqlRequest<CategoryPayload>(
        app.url,
        /* GraphQL */ `
          mutation ($id: ID!, $input: UpdateCategoryInput!) {
            updateCategory(id: $id, input: $input) {
              id
            }
          }
        `,
        { id: categoryBId, input: { name: 'Hijacked' } },
        userAToken,
      )
      const deleteCategoryResponse = await graphqlRequest<CategoryPayload>(
        app.url,
        /* GraphQL */ `
          mutation ($id: ID!) {
            deleteCategory(id: $id) {
              id
            }
          }
        `,
        { id: categoryBId },
        userAToken,
      )
      const updateTransactionResponse = await graphqlRequest<TransactionPayload>(
        app.url,
        /* GraphQL */ `
          mutation ($id: ID!, $input: UpdateTransactionInput!) {
            updateTransaction(id: $id, input: $input) {
              id
            }
          }
        `,
        { id: transactionBId, input: { description: 'Hijacked' } },
        userAToken,
      )
      const deleteTransactionResponse = await graphqlRequest<TransactionPayload>(
        app.url,
        /* GraphQL */ `
          mutation ($id: ID!) {
            deleteTransaction(id: $id) {
              id
            }
          }
        `,
        { id: transactionBId },
        userAToken,
      )

      expect(updateCategoryResponse.errors?.[0]?.extensions?.code).toBe('NOT_FOUND')
      expect(deleteCategoryResponse.errors?.[0]?.extensions?.code).toBe('NOT_FOUND')
      expect(updateTransactionResponse.errors?.[0]?.extensions?.code).toBe('NOT_FOUND')
      expect(deleteTransactionResponse.errors?.[0]?.extensions?.code).toBe('NOT_FOUND')
    })

    it('prevents A from associating transactions with B categories', async () => {
      const response = await graphqlRequest<TransactionPayload>(
        app.url,
        /* GraphQL */ `
          mutation ($input: CreateTransactionInput!) {
            createTransaction(input: $input) {
              id
            }
          }
        `,
        {
          input: {
            description: 'Cross-user category',
            amount: 1000,
            type: 'EXPENSE',
            date: '2026-11-04T12:00:00.000Z',
            categoryId: categoryBId,
          },
        },
        userAToken,
      )

      expect(response.errors?.[0]?.extensions?.code).toBe('NOT_FOUND')
    })
  })

  describe('delete flow', () => {
    it('deletes own transaction then category', async () => {
      const disposableCategory = await graphqlRequest<CategoryPayload>(
        app.url,
        /* GraphQL */ `
          mutation ($input: CreateCategoryInput!) {
            createCategory(input: $input) {
              id
            }
          }
        `,
        { input: { name: 'Temp' } },
        userAToken,
      )
      const categoryId = disposableCategory.data!.createCategory!.id

      const disposableTx = await graphqlRequest<TransactionPayload>(
        app.url,
        /* GraphQL */ `
          mutation ($input: CreateTransactionInput!) {
            createTransaction(input: $input) {
              id
            }
          }
        `,
        {
          input: {
            description: 'Temp expense',
            amount: 1500,
            type: 'EXPENSE',
            date: '2026-11-05T12:00:00.000Z',
            categoryId,
          },
        },
        userAToken,
      )
      const transactionId = disposableTx.data!.createTransaction!.id

      const deleteTx = await graphqlRequest<TransactionPayload>(
        app.url,
        /* GraphQL */ `
          mutation ($id: ID!) {
            deleteTransaction(id: $id) {
              id
            }
          }
        `,
        { id: transactionId },
        userAToken,
      )
      const deleteCategoryResponse = await graphqlRequest<CategoryPayload>(
        app.url,
        /* GraphQL */ `
          mutation ($id: ID!) {
            deleteCategory(id: $id) {
              id
            }
          }
        `,
        { id: categoryId },
        userAToken,
      )

      expect(deleteTx.errors).toBeUndefined()
      expect(deleteCategoryResponse.errors).toBeUndefined()
      expect(deleteCategoryResponse.data?.deleteCategory?.id).toBe(categoryId)
    })
  })
})
