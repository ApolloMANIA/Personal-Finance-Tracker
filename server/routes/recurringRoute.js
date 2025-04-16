import express from "express"
import { addRecurringTransaction, deleteRecurring, getAllRecurring, payRecurringTransaction } from "../controllers/accountController.js"

const router = express.Router();

router.get("/:id",getAllRecurring);
router.post("/add/:id",addRecurringTransaction);
router.post("/pay/:id",payRecurringTransaction);
router.delete("/delete/:id",deleteRecurring);

export default router;
