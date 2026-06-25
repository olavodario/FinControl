import type { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma.js";

const budgetWithCategory = {
  category: true,
} satisfies Prisma.BudgetInclude;

export type BudgetWithCategory = Prisma.BudgetGetPayload<{
  include: typeof budgetWithCategory;
}>;

export async function findBudgetsByUserAndMonth(
  userId: string,
  month: number,
  year: number,
): Promise<BudgetWithCategory[]> {
  return prisma.budget.findMany({
    where: { userId, month, year },
    include: budgetWithCategory,
    orderBy: { category: { name: "asc" } },
  });
}

export async function findBudgetById(id: string): Promise<BudgetWithCategory | null> {
  return prisma.budget.findUnique({ where: { id }, include: budgetWithCategory });
}

export async function findBudgetByUserCategoryMonth(
  userId: string,
  categoryId: string,
  month: number,
  year: number,
): Promise<BudgetWithCategory | null> {
  return prisma.budget.findUnique({
    where: { userId_categoryId_month_year: { userId, categoryId, month, year } },
    include: budgetWithCategory,
  });
}

export async function upsertBudget(
  userId: string,
  categoryId: string,
  month: number,
  year: number,
  amount: number,
): Promise<BudgetWithCategory> {
  return prisma.budget.upsert({
    where: { userId_categoryId_month_year: { userId, categoryId, month, year } },
    create: { userId, categoryId, month, year, amount },
    update: { amount },
    include: budgetWithCategory,
  });
}

export async function deleteBudget(id: string): Promise<void> {
  await prisma.budget.delete({ where: { id } });
}

export async function sumSpentByCategory(
  userId: string,
  categoryId: string,
  month: number,
  year: number,
): Promise<number> {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const agg = await prisma.transaction.aggregate({
    where: {
      account: { userId },
      categoryId,
      type: "EXPENSE",
      date: { gte: start, lt: end },
    },
    _sum: { amount: true },
  });

  return Number(agg._sum.amount ?? 0);
}
