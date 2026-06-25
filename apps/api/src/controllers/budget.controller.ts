import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../middlewares/authenticate.js";
import { budgetFiltersSchema, createBudgetSchema } from "../schemas/budget.schema.js";
import * as budgetService from "../services/budget.service.js";

export async function listBudgetsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const { month, year } = budgetFiltersSchema.parse(req.query);
    const data = await budgetService.listBudgets(userId, month, year);
    res.json({ data, message: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function upsertBudgetController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const dto = createBudgetSchema.parse(req.body);
    const data = await budgetService.upsertBudgetForUser(userId, dto);
    res.status(201).json({ data, message: "Orçamento salvo com sucesso." });
  } catch (err) {
    next(err);
  }
}

export async function deleteBudgetController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    await budgetService.deleteBudgetForUser(req.params["id"]!, userId);
    res.json({ data: null, message: "Orçamento excluído com sucesso." });
  } catch (err) {
    next(err);
  }
}
