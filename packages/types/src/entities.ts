import type { AccountType, CategoryType, TransactionType } from "./enums.js";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  type: CategoryType;
}

export interface Transaction {
  id: string;
  accountId: string;
  toAccountId: string | null;
  categoryId: string | null;
  amount: number;
  description: string;
  date: Date;
  type: TransactionType;
  recurring: boolean;
  createdAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}
