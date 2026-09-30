import express from "express";
import {
    createAccount,
    deleteAccount,
    deleteTransaction,
    getAccountInfo,
    getAllTransactions,
    getUser,
    updateTransaction,
} from "../controllers/accountController.js";
import { authenticate, authorizeSelf } from "../auth/verifyToken.js";

const router = express.Router();

router.use(authenticate);

router.get("/getUser/:id", authorizeSelf, getUser);
router.get("/getAllTransactions/:id", authorizeSelf, getAllTransactions);
router.get("/:id", authorizeSelf, getAccountInfo);
router.post("/add/:id", authorizeSelf, createAccount);
router.delete("/deleteTransaction/:id", deleteTransaction);
router.patch("/updateTransaction/:id", updateTransaction);
router.delete("/deleteAccount/:id", deleteAccount);

export default router;
