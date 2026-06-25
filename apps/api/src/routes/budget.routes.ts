import { Router } from "express";
import {
  deleteBudgetController,
  listBudgetsController,
  upsertBudgetController,
} from "../controllers/budget.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/", listBudgetsController);
router.post("/", upsertBudgetController);
router.delete("/:id", deleteBudgetController);

export default router;
