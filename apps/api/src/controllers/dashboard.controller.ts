import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../middlewares/authenticate.js";
import { dashboardChartsQuerySchema, dashboardQuerySchema } from "../schemas/dashboard.schema.js";
import * as dashboardService from "../services/dashboard.service.js";

export async function getDashboardController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const { month, year } = dashboardQuerySchema.parse(req.query);
    const data = await dashboardService.getDashboard(userId, month, year);
    res.json({ data, message: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function getDashboardChartsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const query = dashboardChartsQuerySchema.parse(req.query);
    const now = new Date();
    const month = query.month ?? now.getMonth() + 1;
    const year = query.year ?? now.getFullYear();
    const data = await dashboardService.getDashboardCharts(userId, month, year);
    res.json({ data, message: "ok" });
  } catch (err) {
    next(err);
  }
}
