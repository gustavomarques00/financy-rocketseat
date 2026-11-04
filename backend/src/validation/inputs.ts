import { z } from 'zod'

const NAME_MAX = 80
const EMAIL_MAX = 254
const PASSWORD_MIN = 8
const PASSWORD_MAX = 72
const CATEGORY_NAME_MAX = 60
const DESCRIPTION_MAX = 200
const AMOUNT_MAX_CENTS = 999_999_999_99

export const registerInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(NAME_MAX, `Name must be at most ${NAME_MAX} characters.`),
  email: z
    .string()
    .trim()
    .max(EMAIL_MAX, `Email must be at most ${EMAIL_MAX} characters.`)
    .email('Invalid email address.'),
  password: z
    .string()
    .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters.`)
    .max(PASSWORD_MAX, `Password must be at most ${PASSWORD_MAX} characters.`),
})

export const loginInputSchema = z.object({
  email: z
    .string()
    .trim()
    .max(EMAIL_MAX)
    .email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.').max(PASSWORD_MAX),
})

export const categoryNameSchema = z
  .string()
  .trim()
  .min(1, 'Category name is required.')
  .max(CATEGORY_NAME_MAX, `Category name must be at most ${CATEGORY_NAME_MAX} characters.`)

export const createCategoryInputSchema = z.object({
  name: categoryNameSchema,
})

export const updateCategoryInputSchema = z.object({
  name: categoryNameSchema,
})

export const transactionTypeSchema = z.enum(['INCOME', 'EXPENSE'])

/**
 * Monetary amounts are stored as integer cents (BRL centavos).
 * GraphQL exposes Int. Values must be strictly positive; zero/negative are rejected.
 * Direction is represented by TransactionType (INCOME | EXPENSE), not by sign.
 */
export const amountCentsSchema = z
  .number()
  .int('Amount must be an integer number of cents.')
  .positive('Amount must be greater than zero.')
  .max(AMOUNT_MAX_CENTS, `Amount must be at most ${AMOUNT_MAX_CENTS} cents.`)

export const descriptionSchema = z
  .string()
  .trim()
  .min(1, 'Description is required.')
  .max(DESCRIPTION_MAX, `Description must be at most ${DESCRIPTION_MAX} characters.`)

export const isoDateSchema = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Date must be a valid ISO-8601 datetime string.',
  })

export const createTransactionInputSchema = z.object({
  description: descriptionSchema,
  amount: amountCentsSchema,
  type: transactionTypeSchema,
  date: isoDateSchema,
  categoryId: z.string().trim().min(1, 'Category is required.'),
})

export const updateTransactionInputSchema = z
  .object({
    description: descriptionSchema.optional(),
    amount: amountCentsSchema.optional(),
    type: transactionTypeSchema.optional(),
    date: isoDateSchema.optional(),
    categoryId: z.string().trim().min(1).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided.',
  })

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(' ')
}
