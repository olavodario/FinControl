import type {
  CategoryResponseDto,
  CreateCategoryRequestDto,
  UpdateCategoryRequestDto,
} from "@fincontrol/types";
import { AppError } from "../utils/appError.js";
import {
  countTransactionsByCategory,
  createCategory,
  deleteCategory,
  findCategoriesByUser,
  findCategoryById,
  updateCategory,
} from "../repositories/category.repository.js";

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Alimentação", color: "#F97316", icon: "food" },
  { name: "Transporte", color: "#3B82F6", icon: "car" },
  { name: "Moradia", color: "#8B5CF6", icon: "home" },
  { name: "Saúde", color: "#EF4444", icon: "health" },
  { name: "Lazer", color: "#EC4899", icon: "entertainment" },
  { name: "Educação", color: "#10B981", icon: "education" },
];

const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salário", color: "#22C55E", icon: "salary" },
  { name: "Freelance", color: "#06B6D4", icon: "freelance" },
  { name: "Investimentos", color: "#F59E0B", icon: "investment" },
];

export async function createDefaultCategoriesForUser(userId: string): Promise<void> {
  const expensePromises = DEFAULT_EXPENSE_CATEGORIES.map((c) =>
    createCategory({ ...c, type: "EXPENSE", user: { connect: { id: userId } } }),
  );
  const incomePromises = DEFAULT_INCOME_CATEGORIES.map((c) =>
    createCategory({ ...c, type: "INCOME", user: { connect: { id: userId } } }),
  );
  await Promise.all([...expensePromises, ...incomePromises]);
}

export async function listCategories(userId: string): Promise<CategoryResponseDto[]> {
  return findCategoriesByUser(userId);
}

export async function getCategory(id: string, userId: string): Promise<CategoryResponseDto> {
  const category = await findCategoryById(id);
  if (!category || category.userId !== userId) {
    throw new AppError("NOT_FOUND", "Categoria não encontrada.", 404);
  }
  return category;
}

export async function createCategoryForUser(
  userId: string,
  dto: CreateCategoryRequestDto,
): Promise<CategoryResponseDto> {
  return createCategory({
    name: dto.name,
    color: dto.color,
    icon: dto.icon,
    type: dto.type,
    user: { connect: { id: userId } },
  });
}

export async function updateCategoryForUser(
  id: string,
  userId: string,
  dto: UpdateCategoryRequestDto,
): Promise<CategoryResponseDto> {
  const existing = await findCategoryById(id);
  if (!existing || existing.userId !== userId) {
    throw new AppError("NOT_FOUND", "Categoria não encontrada.", 404);
  }

  return updateCategory(id, {
    ...(dto.name !== undefined && { name: dto.name }),
    ...(dto.color !== undefined && { color: dto.color }),
    ...(dto.icon !== undefined && { icon: dto.icon }),
  });
}

export async function deleteCategoryForUser(id: string, userId: string): Promise<void> {
  const existing = await findCategoryById(id);
  if (!existing || existing.userId !== userId) {
    throw new AppError("NOT_FOUND", "Categoria não encontrada.", 404);
  }

  const txCount = await countTransactionsByCategory(id);
  if (txCount > 0) {
    throw new AppError(
      "CATEGORY_HAS_TRANSACTIONS",
      "Não é possível excluir uma categoria com transações.",
      409,
    );
  }

  await deleteCategory(id);
}
