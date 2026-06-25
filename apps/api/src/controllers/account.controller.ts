import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../middlewares/authenticate.js";
import { createAccountSchema, updateAccountSchema } from "../schemas/account.schema.js";
import * as accountService from "../services/account.service.js";

export async function listAccountsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const data = await accountService.listAccounts(userId);
    res.json({ data, message: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function getAccountController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const data = await accountService.getAccount(req.params["id"]!, userId);
    res.json({ data, message: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function createAccountController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const dto = createAccountSchema.parse(req.body);
    const data = await accountService.createAccountForUser(userId, dto);
    res.status(201).json({ data, message: "Conta criada com sucesso." });
  } catch (err) {
    next(err);
  }
}

export async function updateAccountController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const dto = updateAccountSchema.parse(req.body);
    const data = await accountService.updateAccountForUser(req.params["id"]!, userId, dto);
    res.json({ data, message: "Conta atualizada com sucesso." });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccountController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    await accountService.deleteAccountForUser(req.params["id"]!, userId);
    res.json({ data: null, message: "Conta excluída com sucesso." });
  } catch (err) {
    next(err);
  }
}
