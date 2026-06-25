import type { DashboardDto } from "@fincontrol/types";
import { findAccountsByUser } from "../repositories/account.repository.js";
import {
  findRecentTransactions,
  sumTransactionsByTypeAndMonth,
} from "../repositories/transaction.repository.js";
import type { TransactionWithDetails } from "../repositories/transaction.repository.js";
import type { TransactionResponseDto } from "@fincontrol/types";

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

export async function getDashboard(userId: string): Promise<DashboardDto> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [accounts, monthIncome, monthExpense, recentTxs] = await Promise.all([
    findAccountsByUser(userId),
    sumTransactionsByTypeAndMonth(userId, "INCOME", month, year),
    sumTransactionsByTypeAndMonth(userId, "EXPENSE", month, year),
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
