import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../middlewares/authenticate.js";
import { monthlyReportQuerySchema } from "../schemas/report.schema.js";
import * as reportService from "../services/report.service.js";

export async function getMonthlyReportController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const now = new Date();
    const { month, year } = monthlyReportQuerySchema.parse(req.query);
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();
    const data = await reportService.getMonthlyReport(userId, m, y);
    res.json({ data, message: "ok" });
  } catch (err) {
    next(err);
  }
}
