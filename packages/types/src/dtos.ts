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
  toAccountId?: string;
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

export interface TransactionFiltersDto {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
}

export interface TransactionWithDetailsDto extends Transaction {
  account: Pick<Account, "id" | "name">;
  category: Pick<Category, "id" | "name" | "color" | "icon" | "type"> | null;
}

export type TransactionResponseDto = TransactionWithDetailsDto;

// Budget DTOs
export interface CreateBudgetRequestDto {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}

export interface BudgetWithSpentDto extends Budget {
  spent: number;
  percentage: number;
  category: Category;
}

export type BudgetResponseDto = BudgetWithSpentDto;

// Pagination
export interface PaginatedResponseDto<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Dashboard
export interface DashboardDto {
  totalBalance: number;
  monthIncome: number;
  monthExpense: number;
  monthBalance: number;
  recentTransactions: TransactionWithDetailsDto[];
  accounts: AccountResponseDto[];
}

// Dashboard Charts
export type BudgetAlertStatus = "ok" | "warning" | "over";

export interface ExpenseByCategoryDto {
  categoryId: string;
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface MonthlyEvolutionDto {
  month: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
}

export interface BudgetAlertDto {
  categoryId: string;
  categoryName: string;
  color: string;
  budgeted: number;
  spent: number;
  percentage: number;
  status: BudgetAlertStatus;
}

export interface DashboardChartsDto {
  expenseByCategory: ExpenseByCategoryDto[];
  monthlyEvolution: MonthlyEvolutionDto[];
  budgetAlerts: BudgetAlertDto[];
}

// Transaction Summary
export interface TransactionSummaryItemDto {
  categoryId: string;
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface TransactionSummaryDto {
  total: number;
  items: TransactionSummaryItemDto[];
}
