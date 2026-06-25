import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["CHECKING", "SAVINGS", "CREDIT", "INVESTMENT"]),
  currency: z.string().length(3).default("BRL"),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(["CHECKING", "SAVINGS", "CREDIT", "INVESTMENT"]).optional(),
  currency: z.string().length(3).optional(),
});
