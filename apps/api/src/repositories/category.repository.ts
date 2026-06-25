import type { Category, Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma.js";

export async function findCategoriesByUser(userId: string): Promise<Category[]> {
  return prisma.category.findMany({ where: { userId }, orderBy: { name: "asc" } });
}

export async function findCategoryById(id: string): Promise<Category | null> {
  return prisma.category.findUnique({ where: { id } });
}

export async function createCategory(data: Prisma.CategoryCreateInput): Promise<Category> {
  return prisma.category.create({ data });
}

export async function updateCategory(
  id: string,
  data: Prisma.CategoryUpdateInput,
): Promise<Category> {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string): Promise<Category> {
  return prisma.category.delete({ where: { id } });
}

export async function findCategoriesByIds(ids: string[]): Promise<Category[]> {
  if (ids.length === 0) return [];
  return prisma.category.findMany({ where: { id: { in: ids } } });
}

export async function countTransactionsByCategory(categoryId: string): Promise<number> {
  return prisma.transaction.count({ where: { categoryId } });
}
