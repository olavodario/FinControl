import type { Account, Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma.js";

export async function findAccountsByUser(userId: string): Promise<Account[]> {
  return prisma.account.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
}

export async function findAccountById(id: string): Promise<Account | null> {
  return prisma.account.findUnique({ where: { id } });
}

export async function createAccount(data: Prisma.AccountCreateInput): Promise<Account> {
  return prisma.account.create({ data });
}

export async function updateAccount(id: string, data: Prisma.AccountUpdateInput): Promise<Account> {
  return prisma.account.update({ where: { id }, data });
}

export async function deleteAccount(id: string): Promise<Account> {
  return prisma.account.delete({ where: { id } });
}

export async function countTransactionsByAccount(accountId: string): Promise<number> {
  return prisma.transaction.count({ where: { accountId } });
}

export async function recalculateAccountBalance(accountId: string): Promise<void> {
  const [incomeAgg, expenseAgg, transferOutAgg, transferInAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: { accountId, type: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { accountId, type: "EXPENSE" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { accountId, type: "TRANSFER" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { toAccountId: accountId, type: "TRANSFER" },
      _sum: { amount: true },
    }),
  ]);

  const income = Number(incomeAgg._sum.amount ?? 0);
  const expense = Number(expenseAgg._sum.amount ?? 0);
  const transferOut = Number(transferOutAgg._sum.amount ?? 0);
  const transferIn = Number(transferInAgg._sum.amount ?? 0);

  const balance = income - expense - transferOut + transferIn;

  await prisma.account.update({ where: { id: accountId }, data: { balance } });
}
