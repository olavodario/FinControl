import { Router } from "express";
import { getMonthlyReportController } from "../controllers/report.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/monthly", getMonthlyReportController);

export default router;
