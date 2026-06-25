import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser um hex válido (ex: #FF5733)"),
  icon: z.string().min(1).max(50),
  type: z.enum(["INCOME", "EXPENSE"]),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser um hex válido (ex: #FF5733)")
    .optional(),
  icon: z.string().min(1).max(50).optional(),
});
