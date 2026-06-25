import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../middlewares/authenticate.js";
import {
  createTransactionSchema,
  transactionFiltersSchema,
  transactionSummaryQuerySchema,
  updateTransactionSchema,
} from "../schemas/transaction.schema.js";
import * as transactionService from "../services/transaction.service.js";

export async function listTransactionsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const filters = transactionFiltersSchema.parse(req.query);
    const data = await transactionService.listTransactions(userId, filters);
    res.json({ data, message: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function getTransactionController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const data = await transactionService.getTransaction(req.params["id"]!, userId);
    res.json({ data, message: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function createTransactionController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const dto = createTransactionSchema.parse(req.body);
    const data = await transactionService.createTransactionForUser(userId, dto);
    res.status(201).json({ data, message: "Transação registrada com sucesso." });
  } catch (err) {
    next(err);
  }
}

export async function updateTransactionController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const dto = updateTransactionSchema.parse(req.body);
    const data = await transactionService.updateTransactionForUser(req.params["id"]!, userId, dto);
    res.json({ data, message: "Transação atualizada com sucesso." });
  } catch (err) {
    next(err);
  }
}

export async function getTransactionSummaryController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const query = transactionSummaryQuerySchema.parse(req.query);
    const now = new Date();
    const month = query.month ?? now.getMonth() + 1;
    const year = query.year ?? now.getFullYear();
    const data = await transactionService.getTransactionSummary(userId, month, year, query.type);
    res.json({ data, message: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function deleteTransactionController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    await transactionService.deleteTransactionForUser(req.params["id"]!, userId);
    res.json({ data: null, message: "Transação excluída com sucesso." });
  } catch (err) {
    next(err);
  }
}
