import express from "express";
import {
    addRecurringTransaction,
    deleteRecurring,
    getAllRecurring,
    payRecurringTransaction,
} from "../controllers/accountController.js";
import { authenticate, authorizeSelf } from "../auth/verifyToken.js";

const router = express.Router();

router.use(authenticate);

router.get("/:id", authorizeSelf, getAllRecurring);
router.post("/add/:id", authorizeSelf, addRecurringTransaction);
router.post("/pay/:id", payRecurringTransaction);
router.delete("/delete/:id", deleteRecurring);

export default router;
