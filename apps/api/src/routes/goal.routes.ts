import { Router } from "express";
import {
  createGoalController,
  deleteGoalController,
  depositGoalController,
  getGoalController,
  listGoalsController,
  updateGoalController,
} from "../controllers/goal.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/", listGoalsController);
router.post("/", createGoalController);
router.get("/:id", getGoalController);
router.put("/:id", updateGoalController);
router.patch("/:id/deposit", depositGoalController);
router.delete("/:id", deleteGoalController);

export default router;
