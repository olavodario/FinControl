import { Router } from "express";
import {
  getDashboardChartsController,
  getDashboardController,
  getDashboardProjectionController,
} from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/", getDashboardController);
router.get("/charts", getDashboardChartsController);
router.get("/projection", getDashboardProjectionController);

export default router;
