import express from "express";
import { createMonthlyData, addTransaction } from "../controllers/accountController.js";
import { authenticate, authorizeSelf } from "../auth/verifyToken.js";

const router = express.Router();

router.use(authenticate);

router.post("/addTransaction/:id", authorizeSelf, addTransaction);
router.post("/:id", authorizeSelf, createMonthlyData);

export default router;
