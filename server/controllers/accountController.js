import { Account, Transaction, MonthlyData, RecurringTransaction } from "../models/AccountSchema.js";
import User from "../models/UserSchema.js";

export const getUser = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id);
        if (user) {
            res.status(200).json({ success: true, message: "Fetched user info", data: user });
        }
        else {
            res.status(400).json({ success: false, message: "user not found" })
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch user info" });
    }

}

export const getAccountInfo = async (req, res) => {

    const id = req.params.id;
    let thisMonthIncome = 0
    let thisMonthExpense = 0
    let prevMonthIncome = 0
    let prevMonthExpense = 0
    try {
        const accounts = await Account.find({ user: id });
        if (accounts) {
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

                        if (transactionYear === currentYear && transactionMonth === currentMonth - 1) {
                            if (transaction.type === "Credited") {
                                prevMonthIncome += Number(transaction.amount);
                            } else if (transaction.type === "Debited") {
                                prevMonthExpense += Number(transaction.amount);
                            }
                        } else if (currentMonth === 0 && transactionYear === currentYear - 1 && transactionMonth === 11) {
                            if (transaction.type === "Credited") {
                                prevMonthIncome += Number(transaction.amount);
                            } else if (transaction.type === "Debited") {
                                prevMonthExpense += Number(transaction.amount);
                            }
                        }
                    });
                }
            });

            const growth = (thisMonthIncome - thisMonthExpense) / (prevMonthIncome - prevMonthExpense) * 100




            res.status(200).json({
                success: true,
                message: "Fetched account info.",
                data: {
                    accounts,
                    headerData: {
                        income: thisMonthIncome,
                        expense: thisMonthExpense,
                        savings: thisMonthIncome - thisMonthExpense,
                        growth: Math.round(growth),
                        incomeGrowth: Math.round(thisMonthIncome / prevMonthIncome * 100),
                        expenseGrowth: Math.round(((thisMonthExpense-prevMonthExpense)/prevMonthExpense) * 100),
                        savingsGrowth: Math.round((thisMonthIncome - thisMonthExpense) / (prevMonthIncome - prevMonthExpense) * 100)
                    }
                }
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch account info." });
    }
}

export const createAccount = async (req, res) => {
    const { type, name, balance } = req.body
    // console.log(type, name, balance)
    const id = req.params.id;
    if (!req.body) {
        return res.status(400).send("Form data invalid.")
    }
    try {
        let account = await Account.findOne({ user: id, name })
        if (account) {
            console.log(account)
            return res.status(400).send("Account already exists");
        }
        await Account.create({ user: id, type, name, balance, transactions: [] });
        return res.status(200).json({ success: true, message: "Account created successfully." })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "Internal server error." })
    }
}


export const addTransaction = async (req, res) => {
    if (!req.body) {
        return res.status(400).send("Form data invalid.")
    }

    console.log(req.body)
    let { type, amount, account, date } = req.body
    console.log(type, amount, account, date)
    date = new Date(date)
    // const month = Number(String(date.getMonth() + 1).padStart(2, '0'));
    // const year = Number(date.getFullYear());
    const id = req.params.id


    try {
        let foundAccount = await Account.findOne({ user: id, name: account })
        // console.log("_______account: ", foundAccount)
        if (foundAccount) {
            let transaction = await Transaction.create({ user: id, type, account, amount, date })
            foundAccount = await Account.findOneAndUpdate({ user: id, name: account }, { $push: { transactions: transaction } }, { new: true })
            await foundAccount.save();
            return res.status(200).json({ success: true, message: "Transaction added." })
        }
        else {
            return res.status(400).json({ success: false, message: "Account does not exist" })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "Internal server error." })
    }

}



export const createMonthlyData = async (req, res) => {
    const { month, year } = req.body
    const id = req.params.id
    if (!req.body) {
        return res.status(400).send("Form data invalid.")
    }
    try {
        const monthlyDataExists = MonthlyData.findOne({ user: id, month, year })
        if (monthlyDataExists) {
            return res.status(400).send("Data already Exists.")
        }
        const monthlyData = await MonthlyData.create({ user: id, month, year });
        return res.status(200).json({ success: true, message: "Monthly data entered." })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error." })
    }
}

export const getAllTransactions = async (req, res) => {
    try {
        const id = req.params.id
        const transactions = await Transaction.find({ user: id })
        return res.status(200).json({ success: true, message: "Got all transactions.", data: transactions })
    } catch (error) {
        console.log(error)

    }
}

export const deleteTransaction = async (req, res) => {
    try {
        const id = req.params.id
        const user = req.body.user
        const transaction = await Transaction.findByIdAndDelete(id)
        if (transaction) {
            const account = await Account.findOneAndUpdate(
                { user, name: transaction.account },
                { $pull: { transactions: { _id: transaction._id } } }, { new: true })
            return res.status(200).json({ success: true, message: "Deleted " + id })
        }

    } catch (err) {
        console.log(err)
    }
}

export const updateTransaction = async (req, res) => {
    try {
        const id = req.params.id
        console.log(id)
        const user = req.body.user
        const amount = req.body.amount
        const transaction = await Transaction.findByIdAndUpdate(id, { amount: amount }, { new: true })
        console.log(transaction)
        if (transaction) {
            let account = await Account.findOneAndUpdate(
                { user, name: transaction.account, 'transactions._id': transaction._id },
                { $set: { 'transactions.$.amount': amount } },
                { new: true })
            console.log(account)
            return res.status(200).json({ success: true, message: "Deleted " + id })
        }

    } catch (err) {
        console.log(err)
    }
}

export const deleteAccount = async (req, res) => {
    try {
        const accountId = req.params.id
        const user = req.body.user
        const account = await Account.findByIdAndDelete(accountId)

        if (account) {
            const deletedTransaction = await Transaction.deleteMany(
                {
                    account: account.name,
                    user: user
                });

            return res.status(200).json({
                success: true,
                message: "Deleted account with ID " + id,
                deletedTransaction: deletedTransaction.deletedCount
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}
export const addRecurringTransaction = async (req, res) => {
    if (!req.body) {
        return res.status(400).send("Form data invalid.")
    }

    console.log(req.body)
    let { type, amount, account, date, frequency } = req.body
    console.log(type, amount, account, date, frequency)
    date = new Date(date)
    const id = req.params.id

    try {
        let recurrTrans = await RecurringTransaction.create({ user: id, type, account, amount, date , frequency})
        console.log(recurrTrans)

        return res.status(200).json({ success: true, message: "Recurring transaction created successfully." })
    } catch (error) {
        console.log(error)
    }

}

export const payRecurringTransaction = async (req, res) => {

    const id = req.params.id;
    const user = req.body.user;
    const recurrTran = await RecurringTransaction.findById(id)
    if (recurrTran) {
        const date = new Date();


        try {
            let foundAccount = await Account.findOne({ user, name: recurrTran.account })
            if (foundAccount) {

                let transaction = await Transaction.create({ user, type:recurrTran.type, account:recurrTran.account, amount:recurrTran.amount, date })
                foundAccount = await Account.findOneAndUpdate({ user, name: recurrTran.account }, { $push: { transactions: transaction } }, { new: true })
                const done = await foundAccount.save();
                console.log(done)

                const updateTran = await RecurringTransaction.findByIdAndUpdate(id, {paidFrequency:recurrTran.paidFrequency+1},{new:true})
                console.log(typeof(updateTran.paidFrequency))
                console.log(typeof(updateTran.frequency))
                if(updateTran.frequency === updateTran.paidFrequency){
                    await RecurringTransaction.findByIdAndDelete(id)
                }

                return res.status(200).json({ success: true, message: "Transaction added." })
            }
            else {
                return res.status(400).json({ success: false, message: "Account does not exist" })
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({ success: false, message: "Internal server error." })
        }
    }

}

export const getAllRecurring = async (req, res) => {
    try {
        const id = req.params.id
        const transactions = await RecurringTransaction.find({ user: id })
        return res.status(200).json({ success: true, message: "Got all transactions.", data: transactions })
    } catch (error) {
        console.log(error)

    }
}

export const deleteRecurring = async (req, res)=>{
    try{
        const id = req.params.id
        const user = req.body.user;
        if(!user){return res.status(400).send("Unathorized.")}
        const recurring = await RecurringTransaction.findByIdAndDelete(id)
        if(recurring){
            console.log(recurring)
            return res.status(200).json({success: true, mesage:"Deleted"})
        }else{
            return res.status(400).send("Not found.")
        }

    }catch(error){
        console.log(error)
    }
}