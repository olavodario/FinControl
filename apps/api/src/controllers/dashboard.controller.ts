import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../middlewares/authenticate.js";
import * as dashboardService from "../services/dashboard.service.js";

export async function getDashboardController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const data = await dashboardService.getDashboard(userId);
    res.json({ data, message: "ok" });
  } catch (err) {
    next(err);
  }
}
