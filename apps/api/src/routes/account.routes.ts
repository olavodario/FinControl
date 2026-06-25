import { Router } from "express";
import {
  createAccountController,
  deleteAccountController,
  getAccountController,
  listAccountsController,
  updateAccountController,
} from "../controllers/account.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/", listAccountsController);
router.post("/", createAccountController);
router.get("/:id", getAccountController);
router.put("/:id", updateAccountController);
router.delete("/:id", deleteAccountController);

export default router;
