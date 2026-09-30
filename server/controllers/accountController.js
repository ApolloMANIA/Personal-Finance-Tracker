import { Account, Transaction, MonthlyData, RecurringTransaction } from "../models/AccountSchema.js";
import User from "../models/UserSchema.js";

const safeGrowth = (current, previous) => {
    if (!previous || previous === 0) return current === 0 ? 0 : 100;
    return Math.round(((current - previous) / Math.abs(previous)) * 100);
};

const applyBalanceChange = (balance, type, amount) => {
    const value = Number(amount) || 0;
    if (type === "Credited") return balance + value;
    if (type === "Debited") return balance - value;
    return balance;
};

export const getUser = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id).select("-password");
        if (user) {
            return res.status(200).json({ success: true, message: "Fetched user info", data: user });
        }
        return res.status(404).json({ success: false, message: "User not found" });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Failed to fetch user info" });
    }
}

export const getAccountInfo = async (req, res) => {
    const id = req.params.id;
    let thisMonthIncome = 0;
    let thisMonthExpense = 0;
    let prevMonthIncome = 0;
    let prevMonthExpense = 0;

    try {
        const accounts = await Account.find({ user: id });
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        accounts.forEach((account) => {
            if (account.transactions && Array.isArray(account.transactions)) {
                account.transactions.forEach((transaction) => {
                    const transactionDate = new Date(transaction.date);
                    const transactionMonth = transactionDate.getMonth();
                    const transactionYear = transactionDate.getFullYear();

                    if (transactionYear === currentYear && transactionMonth === currentMonth) {
                        if (transaction.type === "Credited") {
                            thisMonthIncome += Number(transaction.amount);
                        } else if (transaction.type === "Debited") {
                            thisMonthExpense += Number(transaction.amount);
                        }
                    }

                    const isPrevMonth =
                        (transactionYear === currentYear && transactionMonth === currentMonth - 1) ||
                        (currentMonth === 0 && transactionYear === currentYear - 1 && transactionMonth === 11);

                    if (isPrevMonth) {
                        if (transaction.type === "Credited") {
                            prevMonthIncome += Number(transaction.amount);
                        } else if (transaction.type === "Debited") {
                            prevMonthExpense += Number(transaction.amount);
                        }
                    }
                });
            }
        });

        const thisSavings = thisMonthIncome - thisMonthExpense;
        const prevSavings = prevMonthIncome - prevMonthExpense;

        return res.status(200).json({
            success: true,
            message: "Fetched account info.",
            data: {
                accounts,
                headerData: {
                    income: thisMonthIncome,
                    expense: thisMonthExpense,
                    savings: thisSavings,
                    growth: safeGrowth(thisSavings, prevSavings),
                    incomeGrowth: safeGrowth(thisMonthIncome, prevMonthIncome),
                    expenseGrowth: safeGrowth(thisMonthExpense, prevMonthExpense),
                    savingsGrowth: safeGrowth(thisSavings, prevSavings),
                },
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Failed to fetch account info." });
    }
}

export const createAccount = async (req, res) => {
    const { type, name, balance } = req.body;
    const id = req.params.id;

    if (!type || !name || balance === undefined || balance === null) {
        return res.status(400).json({ success: false, message: "Type, name, and balance are required." });
    }

    try {
        const account = await Account.findOne({ user: id, name });
        if (account) {
            return res.status(400).json({ success: false, message: "Account already exists." });
        }
        await Account.create({ user: id, type, name, balance: Number(balance), transactions: [] });
        return res.status(201).json({ success: true, message: "Account created successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

export const addTransaction = async (req, res) => {
    let { type, amount, account, date } = req.body;
    const id = req.params.id;

    if (!type || amount === undefined || !account || !date) {
        return res.status(400).json({ success: false, message: "Type, amount, account, and date are required." });
    }

    date = new Date(date);

    try {
        let foundAccount = await Account.findOne({ user: id, name: account });
        if (!foundAccount) {
            return res.status(400).json({ success: false, message: "Account does not exist." });
        }

        const transaction = await Transaction.create({ user: id, type, account, amount: String(amount), date });
        const newBalance = applyBalanceChange(foundAccount.balance, type, amount);

        await Account.findOneAndUpdate(
            { user: id, name: account },
            { $push: { transactions: transaction }, $set: { balance: newBalance } },
            { new: true }
        );

        return res.status(200).json({ success: true, message: "Transaction added." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

export const createMonthlyData = async (req, res) => {
    const { month, year } = req.body;
    const id = req.params.id;

    if (!month || !year) {
        return res.status(400).json({ success: false, message: "Month and year are required." });
    }

    try {
        const monthlyDataExists = await MonthlyData.findOne({ user: id, month, year });
        if (monthlyDataExists) {
            return res.status(400).json({ success: false, message: "Data already exists." });
        }
        await MonthlyData.create({ user: id, month, year });
        return res.status(201).json({ success: true, message: "Monthly data entered." });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

export const getAllTransactions = async (req, res) => {
    try {
        const id = req.params.id;
        const transactions = await Transaction.find({ user: id });
        return res.status(200).json({ success: true, message: "Got all transactions.", data: transactions });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch transactions." });
    }
}

export const deleteTransaction = async (req, res) => {
    try {
        const id = req.params.id;
        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ success: false, message: "Transaction not found." });
        }
        if (String(transaction.user) !== String(req.userId)) {
            return res.status(403).json({ success: false, message: "Forbidden." });
        }

        await Transaction.findByIdAndDelete(id);

        const account = await Account.findOne({ user: transaction.user, name: transaction.account });
        if (account) {
            const revertedBalance = applyBalanceChange(
                account.balance,
                transaction.type === "Credited" ? "Debited" : "Credited",
                transaction.amount
            );
            await Account.findOneAndUpdate(
                { user: transaction.user, name: transaction.account },
                {
                    $pull: { transactions: { _id: transaction._id } },
                    $set: { balance: revertedBalance },
                },
                { new: true }
            );
        }

        return res.status(200).json({ success: true, message: "Deleted " + id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Failed to delete transaction." });
    }
}

export const updateTransaction = async (req, res) => {
    try {
        const id = req.params.id;
        const amount = req.body.amount;

        if (amount === undefined || amount === null) {
            return res.status(400).json({ success: false, message: "Amount is required." });
        }

        const existing = await Transaction.findById(id);
        if (!existing) {
            return res.status(404).json({ success: false, message: "Transaction not found." });
        }
        if (String(existing.user) !== String(req.userId)) {
            return res.status(403).json({ success: false, message: "Forbidden." });
        }

        const oldAmount = Number(existing.amount) || 0;
        const newAmount = Number(amount) || 0;
        const delta = newAmount - oldAmount;

        const transaction = await Transaction.findByIdAndUpdate(
            id,
            { amount: String(amount) },
            { new: true }
        );

        const account = await Account.findOne({
            user: existing.user,
            name: existing.account,
            "transactions._id": existing._id,
        });

        if (account) {
            const balanceDelta = existing.type === "Credited" ? delta : -delta;
            await Account.findOneAndUpdate(
                { user: existing.user, name: existing.account, "transactions._id": existing._id },
                {
                    $set: {
                        "transactions.$.amount": String(amount),
                        balance: account.balance + balanceDelta,
                    },
                },
                { new: true }
            );
        }

        return res.status(200).json({ success: true, message: "Updated " + id, data: transaction });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Failed to update transaction." });
    }
}

export const deleteAccount = async (req, res) => {
    try {
        const accountId = req.params.id;
        const account = await Account.findById(accountId);

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found",
            });
        }
        if (String(account.user) !== String(req.userId)) {
            return res.status(403).json({ success: false, message: "Forbidden." });
        }

        await Account.findByIdAndDelete(accountId);
        const deletedTransaction = await Transaction.deleteMany({
            account: account.name,
            user: account.user,
        });

        return res.status(200).json({
            success: true,
            message: "Deleted account with ID " + accountId,
            deletedTransaction: deletedTransaction.deletedCount,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

export const addRecurringTransaction = async (req, res) => {
    let { type, amount, account, date, frequency } = req.body;
    const id = req.params.id;

    if (!type || amount === undefined || !account || !date) {
        return res.status(400).json({ success: false, message: "Type, amount, account, and date are required." });
    }

    date = new Date(date);

    try {
        await RecurringTransaction.create({
            user: id,
            type,
            account,
            amount: String(amount),
            date,
            frequency: Number(frequency) || 0,
        });
        return res.status(201).json({ success: true, message: "Recurring transaction created successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

export const payRecurringTransaction = async (req, res) => {
    const id = req.params.id;

    try {
        const recurrTran = await RecurringTransaction.findById(id);
        if (!recurrTran) {
            return res.status(404).json({ success: false, message: "Recurring transaction not found." });
        }
        if (String(recurrTran.user) !== String(req.userId)) {
            return res.status(403).json({ success: false, message: "Forbidden." });
        }

        const user = recurrTran.user;
        const date = new Date();
        let foundAccount = await Account.findOne({ user, name: recurrTran.account });

        if (!foundAccount) {
            return res.status(400).json({ success: false, message: "Account does not exist." });
        }

        const transaction = await Transaction.create({
            user,
            type: recurrTran.type,
            account: recurrTran.account,
            amount: recurrTran.amount,
            date,
        });

        const newBalance = applyBalanceChange(foundAccount.balance, recurrTran.type, recurrTran.amount);
        await Account.findOneAndUpdate(
            { user, name: recurrTran.account },
            { $push: { transactions: transaction }, $set: { balance: newBalance } },
            { new: true }
        );

        const updateTran = await RecurringTransaction.findByIdAndUpdate(
            id,
            { paidFrequency: recurrTran.paidFrequency + 1 },
            { new: true }
        );

        if (updateTran.frequency > 0 && updateTran.frequency === updateTran.paidFrequency) {
            await RecurringTransaction.findByIdAndDelete(id);
        }

        return res.status(200).json({ success: true, message: "Transaction added." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

export const getAllRecurring = async (req, res) => {
    try {
        const id = req.params.id;
        const transactions = await RecurringTransaction.find({ user: id });
        return res.status(200).json({ success: true, message: "Got all transactions.", data: transactions });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch recurring transactions." });
    }
}

export const deleteRecurring = async (req, res) => {
    try {
        const id = req.params.id;
        const recurring = await RecurringTransaction.findById(id);

        if (!recurring) {
            return res.status(404).json({ success: false, message: "Not found." });
        }
        if (String(recurring.user) !== String(req.userId)) {
            return res.status(403).json({ success: false, message: "Forbidden." });
        }

        await RecurringTransaction.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: "Deleted" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to delete recurring transaction." });
    }
}
