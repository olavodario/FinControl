import { Router } from "express";
import {
  createTransactionController,
  deleteTransactionController,
  exportTransactionsController,
  getTransactionController,
  getTransactionSummaryController,
  listTransactionsController,
  updateTransactionController,
} from "../controllers/transaction.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/summary", getTransactionSummaryController);
router.get("/export", exportTransactionsController);
router.get("/", listTransactionsController);
router.post("/", createTransactionController);
router.get("/:id", getTransactionController);
router.put("/:id", updateTransactionController);
router.delete("/:id", deleteTransactionController);

export default router;
