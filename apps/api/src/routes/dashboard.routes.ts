import { Router } from "express";
import {
  getDashboardChartsController,
  getDashboardController,
} from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/", getDashboardController);
router.get("/charts", getDashboardChartsController);

export default router;
