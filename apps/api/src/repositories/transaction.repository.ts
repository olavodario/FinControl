import type { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma.js";

const transactionWithDetails = {
  account: { select: { id: true, name: true } },
  category: { select: { id: true, name: true, color: true, icon: true, type: true } },
} satisfies Prisma.TransactionInclude;

export type TransactionWithDetails = Prisma.TransactionGetPayload<{
  include: typeof transactionWithDetails;
}>;

export async function findTransactions(
  userId: string,
  filters: {
    accountId?: string;
    categoryId?: string;
    type?: "INCOME" | "EXPENSE" | "TRANSFER";
    startDate?: Date;
    endDate?: Date;
    page: number;
    limit: number;
  },
): Promise<{ items: TransactionWithDetails[]; total: number }> {
  const where: Prisma.TransactionWhereInput = {
    account: { userId },
    ...(filters.accountId && { accountId: filters.accountId }),
    ...(filters.categoryId && { categoryId: filters.categoryId }),
    ...(filters.type && { type: filters.type }),
    ...(filters.startDate || filters.endDate
      ? {
          date: {
            ...(filters.startDate && { gte: filters.startDate }),
            ...(filters.endDate && { lte: filters.endDate }),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: transactionWithDetails,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { items, total };
}

export async function findTransactionById(id: string): Promise<TransactionWithDetails | null> {
  return prisma.transaction.findUnique({
    where: { id },
    include: transactionWithDetails,
  });
}

export async function createTransaction(
  data: Prisma.TransactionUncheckedCreateInput,
): Promise<TransactionWithDetails> {
  return prisma.transaction.create({
    data,
    include: transactionWithDetails,
  });
}

export async function updateTransaction(
  id: string,
  data: Prisma.TransactionUncheckedUpdateInput,
): Promise<TransactionWithDetails> {
  return prisma.transaction.update({
    where: { id },
    data,
    include: transactionWithDetails,
  });
}

export async function deleteTransactionById(id: string): Promise<TransactionWithDetails> {
  return prisma.transaction.delete({
    where: { id },
    include: transactionWithDetails,
  });
}

export async function sumTransactionsByTypeAndMonth(
  userId: string,
  type: "INCOME" | "EXPENSE",
  month: number,
  year: number,
): Promise<number> {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const agg = await prisma.transaction.aggregate({
    where: {
      account: { userId },
      type,
      date: { gte: start, lt: end },
    },
    _sum: { amount: true },
  });

  return Number(agg._sum.amount ?? 0);
}

export async function groupTransactionsByCategoryAndType(
  userId: string,
  type: "INCOME" | "EXPENSE",
  month: number,
  year: number,
): Promise<{ categoryId: string; amount: number; count: number }[]> {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const grouped = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      account: { userId },
      type,
      date: { gte: start, lt: end },
      categoryId: { not: null },
    },
    _sum: { amount: true },
    _count: { id: true },
  });

  return grouped
    .filter((g): g is typeof g & { categoryId: string } => g.categoryId !== null)
    .map((g) => ({
      categoryId: g.categoryId,
      amount: Number(g._sum.amount ?? 0),
      count: g._count.id,
    }));
}

export async function findRecentTransactions(
  userId: string,
  limit: number,
): Promise<TransactionWithDetails[]> {
  return prisma.transaction.findMany({
    where: { account: { userId } },
    include: transactionWithDetails,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function findAllTransactionsForExport(
  userId: string,
  filters: {
    accountId?: string;
    categoryId?: string;
    startDate?: Date;
    endDate?: Date;
  },
): Promise<TransactionWithDetails[]> {
  const where: Prisma.TransactionWhereInput = {
    account: { userId },
    ...(filters.accountId && { accountId: filters.accountId }),
    ...(filters.categoryId && { categoryId: filters.categoryId }),
    ...(filters.startDate || filters.endDate
      ? {
          date: {
            ...(filters.startDate && { gte: filters.startDate }),
            ...(filters.endDate && { lte: filters.endDate }),
          },
        }
      : {}),
  };

  return prisma.transaction.findMany({
    where,
    include: transactionWithDetails,
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });
}
