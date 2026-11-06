import type { PrismaClient, Transaction } from '@prisma/client'
import { AppError } from '../errors.js'
import {
  createTransactionInputSchema,
  formatZodError,
  updateTransactionInputSchema,
} from '../validation/inputs.js'

export type TransactionWithCategory = Transaction & {
  category: {
    id: string
    name: string
    icon: string
    color: string
  }
}

async function assertOwnedCategory(
  prisma: PrismaClient,
  userId: string,
  categoryId: string,
): Promise<void> {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: { id: true },
  })

  if (!category) {
    throw new AppError('Category not found.', 'NOT_FOUND', 404)
  }
}

export async function listTransactions(
  prisma: PrismaClient,
  userId: string,
): Promise<TransactionWithCategory[]> {
  return prisma.transaction.findMany({
    where: { userId },
    include: {
      category: {
        select: { id: true, name: true, icon: true, color: true },
      },
    },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  })
}

export async function getTransaction(
  prisma: PrismaClient,
  userId: string,
  id: string,
): Promise<TransactionWithCategory> {
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId },
    include: {
      category: {
        select: { id: true, name: true, icon: true, color: true },
      },
    },
  })

  if (!transaction) {
    throw new AppError('Transaction not found.', 'NOT_FOUND', 404)
  }

  return transaction
}

export async function createTransaction(
  prisma: PrismaClient,
  userId: string,
  rawInput: unknown,
): Promise<TransactionWithCategory> {
  const parsed = createTransactionInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    throw new AppError(formatZodError(parsed.error), 'BAD_USER_INPUT', 400)
  }

  await assertOwnedCategory(prisma, userId, parsed.data.categoryId)

  return prisma.transaction.create({
    data: {
      description: parsed.data.description,
      amount: parsed.data.amount,
      type: parsed.data.type,
      date: new Date(parsed.data.date),
      categoryId: parsed.data.categoryId,
      userId,
    },
    include: {
      category: {
        select: { id: true, name: true, icon: true, color: true },
      },
    },
  })
}

export async function updateTransaction(
  prisma: PrismaClient,
  userId: string,
  id: string,
  rawInput: unknown,
): Promise<TransactionWithCategory> {
  const parsed = updateTransactionInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    throw new AppError(formatZodError(parsed.error), 'BAD_USER_INPUT', 400)
  }

  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
    select: { id: true },
  })

  if (!existing) {
    throw new AppError('Transaction not found.', 'NOT_FOUND', 404)
  }

  if (parsed.data.categoryId) {
    await assertOwnedCategory(prisma, userId, parsed.data.categoryId)
  }

  return prisma.transaction.update({
    where: { id: existing.id },
    data: {
      ...(parsed.data.description !== undefined
        ? { description: parsed.data.description }
        : {}),
      ...(parsed.data.amount !== undefined ? { amount: parsed.data.amount } : {}),
      ...(parsed.data.type !== undefined ? { type: parsed.data.type } : {}),
      ...(parsed.data.date !== undefined ? { date: new Date(parsed.data.date) } : {}),
      ...(parsed.data.categoryId !== undefined ? { categoryId: parsed.data.categoryId } : {}),
    },
    include: {
      category: {
        select: { id: true, name: true, icon: true, color: true },
      },
    },
  })
}

export async function deleteTransaction(
  prisma: PrismaClient,
  userId: string,
  id: string,
): Promise<TransactionWithCategory> {
  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
    include: {
      category: {
        select: { id: true, name: true, icon: true, color: true },
      },
    },
  })

  if (!existing) {
    throw new AppError('Transaction not found.', 'NOT_FOUND', 404)
  }

  await prisma.transaction.delete({
    where: { id: existing.id },
  })

  return existing
}
