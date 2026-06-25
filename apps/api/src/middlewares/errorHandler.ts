import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/appError.js";
import { AuthError } from "../services/auth.service.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: err.errors.map((e) => e.message).join(", "),
      code: "VALIDATION_ERROR",
    });
    return;
  }

  if (err instanceof AuthError) {
    const status = err.code === "EMAIL_TAKEN" ? 409 : 401;
    res.status(status).json({ error: err.message, code: err.code });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor.", code: "INTERNAL_ERROR" });
}
