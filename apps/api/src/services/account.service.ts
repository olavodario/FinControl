import type {
  AccountResponseDto,
  CreateAccountRequestDto,
  UpdateAccountRequestDto,
} from "../types/index.js";
import { AppError } from "../utils/appError.js";
import {
  countTransactionsByAccount,
  createAccount,
  deleteAccount,
  findAccountById,
  findAccountsByUser,
  updateAccount,
} from "../repositories/account.repository.js";

function toDto(account: {
  id: string;
  userId: string;
  name: string;
  type: string;
  balance: unknown;
  currency: string;
  createdAt: Date;
}): AccountResponseDto {
  return {
    id: account.id,
    userId: account.userId,
    name: account.name,
    type: account.type as AccountResponseDto["type"],
    balance: Number(account.balance),
    currency: account.currency,
    createdAt: account.createdAt,
  };
}

export async function listAccounts(userId: string): Promise<AccountResponseDto[]> {
  const accounts = await findAccountsByUser(userId);
  return accounts.map(toDto);
}

export async function getAccount(id: string, userId: string): Promise<AccountResponseDto> {
  const account = await findAccountById(id);
  if (!account || account.userId !== userId) {
    throw new AppError("NOT_FOUND", "Conta não encontrada.", 404);
  }
  return toDto(account);
}

export async function createAccountForUser(
  userId: string,
  dto: CreateAccountRequestDto,
): Promise<AccountResponseDto> {
  const account = await createAccount({
    name: dto.name,
    type: dto.type,
    currency: dto.currency ?? "BRL",
    user: { connect: { id: userId } },
  });
  return toDto(account);
}

export async function updateAccountForUser(
  id: string,
  userId: string,
  dto: UpdateAccountRequestDto,
): Promise<AccountResponseDto> {
  const existing = await findAccountById(id);
  if (!existing || existing.userId !== userId) {
    throw new AppError("NOT_FOUND", "Conta não encontrada.", 404);
  }

  const account = await updateAccount(id, {
    ...(dto.name !== undefined && { name: dto.name }),
    ...(dto.type !== undefined && { type: dto.type }),
    ...(dto.currency !== undefined && { currency: dto.currency }),
  });
  return toDto(account);
}

export async function deleteAccountForUser(id: string, userId: string): Promise<void> {
  const existing = await findAccountById(id);
  if (!existing || existing.userId !== userId) {
    throw new AppError("NOT_FOUND", "Conta não encontrada.", 404);
  }

  const txCount = await countTransactionsByAccount(id);
  if (txCount > 0) {
    throw new AppError(
      "ACCOUNT_HAS_TRANSACTIONS",
      "Não é possível excluir uma conta com transações.",
      409,
    );
  }

  await deleteAccount(id);
}
