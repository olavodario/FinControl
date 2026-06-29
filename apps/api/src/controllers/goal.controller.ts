import type { NextFunction, Request, Response } from "express";
import type { GoalStatus } from "../types/index.js";
import type { AuthRequest } from "../middlewares/authenticate.js";
import {
  createGoalSchema,
  depositGoalSchema,
  goalFiltersSchema,
  updateGoalSchema,
} from "../schemas/goal.schema.js";
import * as goalService from "../services/goal.service.js";

export async function listGoalsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const { status } = goalFiltersSchema.parse(req.query);
    const data = await goalService.listGoals(userId, status as GoalStatus | undefined);
    res.json({ data, message: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function getGoalController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const data = await goalService.getGoal(req.params["id"]!, userId);
    res.json({ data, message: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function createGoalController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const dto = createGoalSchema.parse(req.body);
    const data = await goalService.createGoalForUser(userId, dto);
    res.status(201).json({ data, message: "Meta criada com sucesso." });
  } catch (err) {
    next(err);
  }
}

export async function updateGoalController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const dto = updateGoalSchema.parse(req.body);
    const data = await goalService.updateGoalForUser(req.params["id"]!, userId, dto);
    res.json({ data, message: "Meta atualizada com sucesso." });
  } catch (err) {
    next(err);
  }
}

export async function depositGoalController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const dto = depositGoalSchema.parse(req.body);
    const data = await goalService.depositToGoal(req.params["id"]!, userId, dto);
    res.json({ data, message: "Depósito realizado com sucesso." });
  } catch (err) {
    next(err);
  }
}

export async function deleteGoalController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    await goalService.deleteGoalForUser(req.params["id"]!, userId);
    res.json({ data: null, message: "Meta removida com sucesso." });
  } catch (err) {
    next(err);
  }
}
