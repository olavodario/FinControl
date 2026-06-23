import type { NextFunction, Request, Response } from "express";
import { loginSchema, refreshTokenSchema, registerSchema } from "../schemas/auth.schema.js";
import * as authService from "../services/auth.service.js";

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dto = registerSchema.parse(req.body);
    const result = await authService.register(dto);
    res.status(201).json({ data: result, message: "Usuário criado com sucesso." });
  } catch (err) {
    next(err);
  }
}

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dto = loginSchema.parse(req.body);
    const result = await authService.login(dto);
    res.json({ data: result, message: "Login realizado com sucesso." });
  } catch (err) {
    next(err);
  }
}

export async function refreshController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const result = await authService.refresh(refreshToken);
    res.json({ data: result, message: "Token renovado." });
  } catch (err) {
    next(err);
  }
}

export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    authService.logout(refreshToken);
    res.json({ data: null, message: "Logout realizado com sucesso." });
  } catch (err) {
    next(err);
  }
}
