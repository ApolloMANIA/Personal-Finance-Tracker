import express from "express"
import { createMonthlyData, addTransaction } from "../controllers/accountController.js"

const router = express.Router();

router.post("/:id",createMonthlyData);
router.post("/addTransaction/:id",addTransaction);

export default router;
