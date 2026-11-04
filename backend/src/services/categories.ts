import { Prisma, type Category, type PrismaClient } from '@prisma/client'
import { AppError } from '../errors.js'
import {
  createCategoryInputSchema,
  formatZodError,
  updateCategoryInputSchema,
} from '../validation/inputs.js'

export async function listCategories(prisma: PrismaClient, userId: string): Promise<Category[]> {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  })
}

export async function getCategory(
  prisma: PrismaClient,
  userId: string,
  id: string,
): Promise<Category> {
  const category = await prisma.category.findFirst({
    where: { id, userId },
  })

  if (!category) {
    throw new AppError('Category not found.', 'NOT_FOUND', 404)
  }

  return category
}

export async function createCategory(
  prisma: PrismaClient,
  userId: string,
  rawInput: unknown,
): Promise<Category> {
  const parsed = createCategoryInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    throw new AppError(formatZodError(parsed.error), 'BAD_USER_INPUT', 400)
  }

  try {
    return await prisma.category.create({
      data: {
        name: parsed.data.name,
        userId,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('A category with this name already exists.', 'CONFLICT', 409)
    }

    throw error
  }
}

export async function updateCategory(
  prisma: PrismaClient,
  userId: string,
  id: string,
  rawInput: unknown,
): Promise<Category> {
  const parsed = updateCategoryInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    throw new AppError(formatZodError(parsed.error), 'BAD_USER_INPUT', 400)
  }

  const existing = await prisma.category.findFirst({
    where: { id, userId },
  })

  if (!existing) {
    throw new AppError('Category not found.', 'NOT_FOUND', 404)
  }

  try {
    return await prisma.category.update({
      where: { id: existing.id },
      data: { name: parsed.data.name },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('A category with this name already exists.', 'CONFLICT', 409)
    }

    throw error
  }
}

export async function deleteCategory(
  prisma: PrismaClient,
  userId: string,
  id: string,
): Promise<Category> {
  const existing = await prisma.category.findFirst({
    where: { id, userId },
    include: {
      _count: {
        select: { transactions: true },
      },
    },
  })

  if (!existing) {
    throw new AppError('Category not found.', 'NOT_FOUND', 404)
  }

  if (existing._count.transactions > 0) {
    throw new AppError(
      'Cannot delete a category that still has transactions.',
      'CATEGORY_IN_USE',
      409,
    )
  }

  return prisma.category.delete({
    where: { id: existing.id },
  })
}
