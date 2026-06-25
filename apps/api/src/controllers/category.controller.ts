import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../middlewares/authenticate.js";
import { createCategorySchema, updateCategorySchema } from "../schemas/category.schema.js";
import * as categoryService from "../services/category.service.js";

export async function listCategoriesController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const data = await categoryService.listCategories(userId);
    res.json({ data, message: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function getCategoryController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const data = await categoryService.getCategory(req.params["id"]!, userId);
    res.json({ data, message: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function createCategoryController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const dto = createCategorySchema.parse(req.body);
    const data = await categoryService.createCategoryForUser(userId, dto);
    res.status(201).json({ data, message: "Categoria criada com sucesso." });
  } catch (err) {
    next(err);
  }
}

export async function updateCategoryController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const dto = updateCategorySchema.parse(req.body);
    const data = await categoryService.updateCategoryForUser(req.params["id"]!, userId, dto);
    res.json({ data, message: "Categoria atualizada com sucesso." });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategoryController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    await categoryService.deleteCategoryForUser(req.params["id"]!, userId);
    res.json({ data: null, message: "Categoria excluída com sucesso." });
  } catch (err) {
    next(err);
  }
}
