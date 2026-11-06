export type User = {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export type AuthPayload = {
  token: string
  user: User
}

export type Category = {
  id: string
  name: string
  description: string | null
  icon: string
  color: string
  createdAt: string
  updatedAt: string
}

export type TransactionType = 'INCOME' | 'EXPENSE'

export type Transaction = {
  id: string
  description: string
  amount: number
  type: TransactionType
  date: string
  categoryId: string
  category: {
    id: string
    name: string
    icon: string
    color: string
  }
  createdAt: string
  updatedAt: string
}

export type GraphQLErrorShape = {
  message: string
  extensions?: {
    code?: string
  }
}
