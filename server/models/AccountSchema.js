import mongoose from "mongoose";


const transactionSchema = new mongoose.Schema({
    user:{
        type:String,
        required: true
    },
    type:{
        type:String,
        required: true
    },
    account:{
        type:String,
        required:true
    },
    amount:{
        type:String
    },
    date:{
        type:Date,
        required: true
    },
    
})

const recurringTransactionSchema = new mongoose.Schema({
    user:{
        type:String,
        required: true
    },
    type:{
        type:String,
        required: true
    },
    account:{
        type:String,
        required:true
    },
    amount:{
        type:String
    },
    date:{
        type:Date,
        required: true
    },
    frequency:{
        type:Number,
         default:0
         
    },
    paidFrequency:{
        type:Number,
        default:0
    }
    
})

const accountSchema =  new mongoose.Schema({
    user :{
        type:String,
        required:true,
    },
    type:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required: true,
    },
    balance:{
        type:Number,
        required: true
    },
    transactions:{
        type:[transactionSchema]
    }
})

const budgetSchema =  new mongoose.Schema({
    user :{
        type:String,
        required:true,
    },
    savings:{
        type:String,
        required: true,
    },
    expenses:{
        type:Number,
        required: true
    },
})





const monthlyExpenseSchema = new mongoose.Schema({
    user:{
        type:String,
    },
    month:{
        type:Number,
        required:true,
        min: 1,
        max:12
    },
    year:{
        type:Number,
        required:true,
    },
    transaction:{
        type:[transactionSchema],
    },
})

const Account = mongoose.model('Account', accountSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const MonthlyData = mongoose.model ('MonthlyData', monthlyExpenseSchema);
const Budget = mongoose.model ('Budget', budgetSchema);
const RecurringTransaction = mongoose.model ('RecurringTransaction', recurringTransactionSchema);

export {Account , Transaction , MonthlyData, Budget, RecurringTransaction}