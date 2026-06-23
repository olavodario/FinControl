import type { AccountType, CategoryType, TransactionType } from "./enums.js";
import type { Account, Budget, Category, Transaction, User } from "./entities.js";

// Auth DTOs
export interface RegisterRequestDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  user: Omit<User, "createdAt" | "updatedAt">;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface RefreshTokenResponseDto {
  accessToken: string;
}

// Account DTOs
export interface CreateAccountRequestDto {
  name: string;
  type: AccountType;
  balance?: number;
  currency?: string;
}

export interface UpdateAccountRequestDto {
  name?: string;
  type?: AccountType;
  currency?: string;
}

export type AccountResponseDto = Account;

// Category DTOs
export interface CreateCategoryRequestDto {
  name: string;
  color: string;
  icon: string;
  type: CategoryType;
}

export interface UpdateCategoryRequestDto {
  name?: string;
  color?: string;
  icon?: string;
}

export type CategoryResponseDto = Category;

// Transaction DTOs
export interface CreateTransactionRequestDto {
  accountId: string;
  categoryId?: string;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  recurring?: boolean;
}

export interface UpdateTransactionRequestDto {
  categoryId?: string | null;
  amount?: number;
  description?: string;
  date?: string;
  type?: TransactionType;
  recurring?: boolean;
}

export type TransactionResponseDto = Transaction;

// Budget DTOs
export interface CreateBudgetRequestDto {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}

export interface UpdateBudgetRequestDto {
  amount?: number;
}

export type BudgetResponseDto = Budget;
