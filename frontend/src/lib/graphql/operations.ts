import { gql } from 'graphql-request'

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        name
        email
        createdAt
        updatedAt
      }
    }
  }
`

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        name
        email
        createdAt
        updatedAt
      }
    }
  }
`

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      createdAt
      updatedAt
    }
  }
`

export const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      id
      name
      createdAt
      updatedAt
    }
  }
`

export const CREATE_CATEGORY_MUTATION = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_CATEGORY_MUTATION = gql`
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      createdAt
      updatedAt
    }
  }
`

export const DELETE_CATEGORY_MUTATION = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id) {
      id
      name
    }
  }
`

export const TRANSACTIONS_QUERY = gql`
  query Transactions {
    transactions {
      id
      description
      amount
      type
      date
      categoryId
      category {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`

export const CREATE_TRANSACTION_MUTATION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
      description
      amount
      type
      date
      categoryId
      category {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_TRANSACTION_MUTATION = gql`
  mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) {
    updateTransaction(id: $id, input: $input) {
      id
      description
      amount
      type
      date
      categoryId
      category {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`

export const DELETE_TRANSACTION_MUTATION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id) {
      id
      description
    }
  }
`
