import express from "express";

import { createAccount, deleteAccount, deleteTransaction, getAccountInfo, getAllTransactions, getUser, updateTransaction } from "../controllers/accountController.js";
import {authenticate} from "../auth/verifyToken.js";


const router = express.Router();

router.get("/:id",getAccountInfo);
router.post("/add/:id",createAccount)
router.get("/getAllTransactions/:id",getAllTransactions)
router.get("/getUser/:id",getUser)
router.delete("/deleteTransaction/:id",deleteTransaction)
router.patch("/updateTransaction/:id",updateTransaction)
router.delete("/deleteAccount/:id", deleteAccount)



export default router;
