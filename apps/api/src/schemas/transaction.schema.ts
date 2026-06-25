import { z } from "zod";

export const createTransactionSchema = z
  .object({
    accountId: z.string().min(1),
    toAccountId: z.string().min(1).optional(),
    categoryId: z.string().min(1).optional(),
    amount: z.number().positive(),
    description: z.string().min(1).max(255),
    date: z.string().datetime({ offset: true }).or(z.string().date()),
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
    recurring: z.boolean().default(false),
  })
  .refine((data) => data.type !== "TRANSFER" || !!data.toAccountId, {
    message: "toAccountId é obrigatório para transferências.",
    path: ["toAccountId"],
  });

export const updateTransactionSchema = z.object({
  categoryId: z.string().min(1).nullable().optional(),
  amount: z.number().positive().optional(),
  description: z.string().min(1).max(255).optional(),
  date: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]).optional(),
  recurring: z.boolean().optional(),
});

export const transactionFiltersSchema = z.object({
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
