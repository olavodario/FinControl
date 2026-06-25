import type {
  BudgetAlertDto,
  BudgetAlertStatus,
  DashboardChartsDto,
  DashboardDto,
} from "@fincontrol/types";
import { findCategoriesByIds } from "../repositories/category.repository.js";
import { findAccountsByUser } from "../repositories/account.repository.js";
import {
  findRecentTransactions,
  groupTransactionsByCategoryAndType,
  sumTransactionsByTypeAndMonth,
} from "../repositories/transaction.repository.js";
import type { TransactionWithDetails } from "../repositories/transaction.repository.js";
import type { TransactionResponseDto } from "@fincontrol/types";
import {
  findBudgetsByUserAndMonth,
  sumSpentByCategory,
} from "../repositories/budget.repository.js";

function txToDto(tx: TransactionWithDetails): TransactionResponseDto {
  return {
    id: tx.id,
    accountId: tx.accountId,
    toAccountId: tx.toAccountId,
    categoryId: tx.categoryId,
    amount: Number(tx.amount),
    description: tx.description,
    date: tx.date,
    type: tx.type,
    recurring: tx.recurring,
    createdAt: tx.createdAt,
    account: tx.account,
    category: tx.category,
  };
}

export async function getDashboard(
  userId: string,
  month?: number,
  year?: number,
): Promise<DashboardDto> {
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();

  const [accounts, monthIncome, monthExpense, recentTxs] = await Promise.all([
    findAccountsByUser(userId),
    sumTransactionsByTypeAndMonth(userId, "INCOME", m, y),
    sumTransactionsByTypeAndMonth(userId, "EXPENSE", m, y),
    findRecentTransactions(userId, 5),
  ]);

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  return {
    totalBalance,
    monthIncome,
    monthExpense,
    monthBalance: monthIncome - monthExpense,
    recentTransactions: recentTxs.map(txToDto),
    accounts: accounts.map((a) => ({
      id: a.id,
      userId: a.userId,
      name: a.name,
      type: a.type,
      balance: Number(a.balance),
      currency: a.currency,
      createdAt: a.createdAt,
    })),
  };
}

export async function getDashboardCharts(
  userId: string,
  month: number,
  year: number,
): Promise<DashboardChartsDto> {
  // 1. Expenses by category
  const expenseGroups = await groupTransactionsByCategoryAndType(userId, "EXPENSE", month, year);
  const expenseCategoryIds = expenseGroups.map((g) => g.categoryId);
  const expenseCategories = await findCategoriesByIds(expenseCategoryIds);
  const totalExpense = expenseGroups.reduce((sum, g) => sum + g.amount, 0);

  const expenseByCategory = expenseGroups
    .map((g) => {
      const cat = expenseCategories.find((c) => c.id === g.categoryId);
      return {
        categoryId: g.categoryId,
        categoryName: cat?.name ?? "Sem categoria",
        color: cat?.color ?? "#808080",
        amount: g.amount,
        percentage: totalExpense > 0 ? Number(((g.amount / totalExpense) * 100).toFixed(1)) : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // 2. Monthly evolution (last 6 months, inclusive)
  const monthsToFetch: { month: number; year: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    let m = month - i;
    let y = year;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    monthsToFetch.push({ month: m, year: y });
  }

  const monthlyEvolution = await Promise.all(
    monthsToFetch.map(async ({ month: m, year: y }) => {
      const [income, expense] = await Promise.all([
        sumTransactionsByTypeAndMonth(userId, "INCOME", m, y),
        sumTransactionsByTypeAndMonth(userId, "EXPENSE", m, y),
      ]);
      return { month: m, year: y, income, expense, balance: income - expense };
    }),
  );

  // 3. Budget alerts
  const budgets = await findBudgetsByUserAndMonth(userId, month, year);
  const budgetAlerts: BudgetAlertDto[] = await Promise.all(
    budgets.map(async (b) => {
      const spent = await sumSpentByCategory(userId, b.categoryId, month, year);
      const budgeted = Number(b.amount);
      const percentage = budgeted > 0 ? Number(((spent / budgeted) * 100).toFixed(1)) : 0;
      const status: BudgetAlertStatus =
        percentage > 100 ? "over" : percentage >= 80 ? "warning" : "ok";
      return {
        categoryId: b.categoryId,
        categoryName: b.category.name,
        color: b.category.color,
        budgeted,
        spent,
        percentage,
        status,
      };
    }),
  );

  budgetAlerts.sort((a, b) => b.percentage - a.percentage);

  return { expenseByCategory, monthlyEvolution, budgetAlerts };
}
