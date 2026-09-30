import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoute from "./routes/auth.js";
import getAccountInfoRoute from "./routes/accountRoute.js";
import montlyDataRoute from "./routes/monthlyDataRoute.js";
import recurringRoue from "./routes/recurringRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);

console.log("CORS allowed origins:", allowedOrigins);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin(origin, callback) {
            // Allow non-browser tools (no Origin) and configured frontends
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            // Reject without throwing — throwing causes a 500 with no CORS headers
            return callback(null, false);
        },
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

app.use("/api/auth", authRoute);
app.use("/api/account", getAccountInfoRoute);
app.use("/api/monthlyData", montlyDataRoute);
app.use("/api/recurring", recurringRoue);

app.get("/", (req, res) => {
    res.json({ success: true, message: "Personal Finance Tracker API is running." });
});

app.get("/api/health", (req, res) => {
    res.json({ success: true, status: "ok" });
});

const connectDB = async () => {
    if (!process.env.JWT_SECRET_KEY) {
        console.error("JWT_SECRET_KEY is not set. Check your .env file.");
        process.exit(1);
    }

    try {
        let uri = process.env.MONGO_URI;

        // Local demo fallback when no Atlas/local URI is configured
        if (!uri) {
            const { MongoMemoryServer } = await import("mongodb-memory-server");
            const memoryServer = await MongoMemoryServer.create();
            uri = memoryServer.getUri("finance");
            console.log("Using in-memory MongoDB (set MONGO_URI for persistent data).");
        }

        await mongoose.connect(uri);
        console.log("Connected to MongoDB.");
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err.message);
        process.exit(1);
    }
};

const start = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}...`);
    });
};

start();
