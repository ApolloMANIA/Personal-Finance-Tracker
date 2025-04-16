import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoute from "./routes/auth.js"
import getAccountInfoRoute from "./routes/accountRoute.js"
import montlyDataRoute from "./routes/monthlyDataRoute.js"
import recurringRoue from "./routes/recurringRoute.js"


dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));

app.use('/api/auth',authRoute);
app.use('/api/account/',getAccountInfoRoute);
app.use('/api/monthlyData/',montlyDataRoute);
app.use('/api/recurring/',recurringRoue);


const uri = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(uri)
        console.log("connected to db.")
    }
    catch (err) {
        console.log(err)
    }
}


app.get('/',(req,res)=>{
    res.send("API running...");
})

app.listen(3000,()=>{
    console.log("Server is running on port 3000...");
    connectDB();
})
