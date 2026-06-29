import type { BudgetResponseDto, CreateBudgetRequestDto } from "../types/index.js";
import { AppError } from "../utils/appError.js";
import {
  deleteBudget,
  findBudgetById,
  findBudgetsByUserAndMonth,
  sumSpentByCategory,
  upsertBudget,
} from "../repositories/budget.repository.js";
import { findCategoryById } from "../repositories/category.repository.js";
import type { BudgetWithCategory } from "../repositories/budget.repository.js";

async function toDto(budget: BudgetWithCategory, userId: string): Promise<BudgetResponseDto> {
  const spent = await sumSpentByCategory(userId, budget.categoryId, budget.month, budget.year);
  const amount = Number(budget.amount);
  const percentage = amount > 0 ? (spent / amount) * 100 : 0;

  return {
    id: budget.id,
    userId: budget.userId,
    categoryId: budget.categoryId,
    amount,
    month: budget.month,
    year: budget.year,
    spent,
    percentage: Math.round(percentage * 100) / 100,
    category: {
      id: budget.category.id,
      userId: budget.category.userId,
      name: budget.category.name,
      color: budget.category.color,
      icon: budget.category.icon,
      type: budget.category.type,
    },
  };
}

export async function listBudgets(
  userId: string,
  month: number,
  year: number,
): Promise<BudgetResponseDto[]> {
  const budgets = await findBudgetsByUserAndMonth(userId, month, year);
  return Promise.all(budgets.map((b) => toDto(b, userId)));
}

export async function upsertBudgetForUser(
  userId: string,
  dto: CreateBudgetRequestDto,
): Promise<BudgetResponseDto> {
  const category = await findCategoryById(dto.categoryId);
  if (!category || category.userId !== userId) {
    throw new AppError("NOT_FOUND", "Categoria não encontrada.", 404);
  }

  const budget = await upsertBudget(userId, dto.categoryId, dto.month, dto.year, dto.amount);
  return toDto(budget, userId);
}

export async function deleteBudgetForUser(id: string, userId: string): Promise<void> {
  const budget = await findBudgetById(id);
  if (!budget || budget.userId !== userId) {
    throw new AppError("NOT_FOUND", "Orçamento não encontrado.", 404);
  }
  await deleteBudget(id);
}
