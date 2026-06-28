import type { MonthlyReportCategoryDto, MonthlyReportDto } from "@fincontrol/types";
import { findCategoriesByIds } from "../repositories/category.repository.js";
import {
  groupTransactionsByCategoryAndType,
  sumTransactionsByTypeAndMonth,
} from "../repositories/transaction.repository.js";

export async function getMonthlyReport(
  userId: string,
  month: number,
  year: number,
): Promise<MonthlyReportDto> {
  const [totalIncome, totalExpense, expenseGroups, incomeGroups] = await Promise.all([
    sumTransactionsByTypeAndMonth(userId, "INCOME", month, year),
    sumTransactionsByTypeAndMonth(userId, "EXPENSE", month, year),
    groupTransactionsByCategoryAndType(userId, "EXPENSE", month, year),
    groupTransactionsByCategoryAndType(userId, "INCOME", month, year),
  ]);

  const allCategoryIds = [
    ...expenseGroups.map((g) => g.categoryId),
    ...incomeGroups.map((g) => g.categoryId),
  ];
  const categories = await findCategoriesByIds(allCategoryIds);

  function toItems(
    groups: { categoryId: string; amount: number; count: number }[],
    total: number,
  ): MonthlyReportCategoryDto[] {
    return groups
      .map((g) => {
        const cat = categories.find((c) => c.id === g.categoryId);
        return {
          categoryId: g.categoryId,
          categoryName: cat?.name ?? "Sem categoria",
          color: cat?.color ?? "#808080",
          amount: g.amount,
          percentage: total > 0 ? Number(((g.amount / total) * 100).toFixed(1)) : 0,
          count: g.count,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }

  return {
    month,
    year,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    expenseByCategory: toItems(expenseGroups, totalExpense),
    incomeByCategory: toItems(incomeGroups, totalIncome),
  };
}
