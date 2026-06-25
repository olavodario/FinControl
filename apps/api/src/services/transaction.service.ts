import type {
  CreateTransactionRequestDto,
  PaginatedResponseDto,
  TransactionFiltersDto,
  TransactionResponseDto,
  UpdateTransactionRequestDto,
} from "@fincontrol/types";
import { AppError } from "../utils/appError.js";
import { findAccountById, recalculateAccountBalance } from "../repositories/account.repository.js";
import {
  createTransaction,
  deleteTransactionById,
  findTransactionById,
  findTransactions,
  updateTransaction,
} from "../repositories/transaction.repository.js";
import type { TransactionWithDetails } from "../repositories/transaction.repository.js";

function toDto(tx: TransactionWithDetails): TransactionResponseDto {
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

export async function listTransactions(
  userId: string,
  filters: TransactionFiltersDto,
): Promise<PaginatedResponseDto<TransactionResponseDto>> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (filters.month && filters.year) {
    startDate = new Date(filters.year, filters.month - 1, 1);
    endDate = new Date(filters.year, filters.month, 0, 23, 59, 59);
  } else {
    if (filters.startDate) startDate = new Date(filters.startDate);
    if (filters.endDate) endDate = new Date(filters.endDate);
  }

  const { items, total } = await findTransactions(userId, {
    accountId: filters.accountId,
    categoryId: filters.categoryId,
    type: filters.type,
    startDate,
    endDate,
    page,
    limit,
  });

  return {
    items: items.map(toDto),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

export async function getTransaction(id: string, userId: string): Promise<TransactionResponseDto> {
  const tx = await findTransactionById(id);
  if (!tx || tx.account.id !== tx.accountId) {
    const account = await findAccountById(tx?.accountId ?? "");
    if (!account || account.userId !== userId) {
      throw new AppError("NOT_FOUND", "Transação não encontrada.", 404);
    }
  }

  const account = await findAccountById(tx!.accountId);
  if (!account || account.userId !== userId) {
    throw new AppError("NOT_FOUND", "Transação não encontrada.", 404);
  }

  return toDto(tx!);
}

export async function createTransactionForUser(
  userId: string,
  dto: CreateTransactionRequestDto,
): Promise<TransactionResponseDto> {
  const account = await findAccountById(dto.accountId);
  if (!account || account.userId !== userId) {
    throw new AppError("NOT_FOUND", "Conta não encontrada.", 404);
  }

  if (dto.type === "TRANSFER") {
    if (!dto.toAccountId) {
      throw new AppError("VALIDATION_ERROR", "toAccountId é obrigatório para transferências.", 400);
    }
    const toAccount = await findAccountById(dto.toAccountId);
    if (!toAccount || toAccount.userId !== userId) {
      throw new AppError("NOT_FOUND", "Conta de destino não encontrada.", 404);
    }
  }

  const tx = await createTransaction({
    accountId: dto.accountId,
    toAccountId: dto.toAccountId ?? null,
    categoryId: dto.categoryId ?? null,
    amount: dto.amount,
    description: dto.description,
    date: new Date(dto.date),
    type: dto.type,
    recurring: dto.recurring ?? false,
  });

  await recalculateAccountBalance(dto.accountId);
  if (dto.toAccountId) {
    await recalculateAccountBalance(dto.toAccountId);
  }

  return toDto(tx);
}

export async function updateTransactionForUser(
  id: string,
  userId: string,
  dto: UpdateTransactionRequestDto,
): Promise<TransactionResponseDto> {
  const existing = await findTransactionById(id);
  if (!existing) throw new AppError("NOT_FOUND", "Transação não encontrada.", 404);

  const account = await findAccountById(existing.accountId);
  if (!account || account.userId !== userId) {
    throw new AppError("NOT_FOUND", "Transação não encontrada.", 404);
  }

  const tx = await updateTransaction(id, {
    ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
    ...(dto.amount !== undefined && { amount: dto.amount }),
    ...(dto.description !== undefined && { description: dto.description }),
    ...(dto.date !== undefined && { date: new Date(dto.date) }),
    ...(dto.type !== undefined && { type: dto.type }),
    ...(dto.recurring !== undefined && { recurring: dto.recurring }),
  });

  await recalculateAccountBalance(existing.accountId);
  if (existing.toAccountId) {
    await recalculateAccountBalance(existing.toAccountId);
  }

  return toDto(tx);
}

export async function deleteTransactionForUser(id: string, userId: string): Promise<void> {
  const existing = await findTransactionById(id);
  if (!existing) throw new AppError("NOT_FOUND", "Transação não encontrada.", 404);

  const account = await findAccountById(existing.accountId);
  if (!account || account.userId !== userId) {
    throw new AppError("NOT_FOUND", "Transação não encontrada.", 404);
  }

  const toAccountId = existing.toAccountId;

  await deleteTransactionById(id);

  await recalculateAccountBalance(existing.accountId);
  if (toAccountId) {
    await recalculateAccountBalance(toAccountId);
  }
}
