import express from 'express';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' }); // Explicitly load from backend directory

import { connectDB } from './config/database.js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.BACKEND_SERVER_HOST || "http://localhost"; // Default if undefined

app.use(cors({
    origin: ["http://localhost:5173",
            "http://localhost:3001",
            "http://localhost:3000"], // Allow frontend URLs
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));

app.use(express.json());


app.listen(PORT, () => {
    connectDB();
    console.log(`🚀 Server is running on ${HOST}:${PORT}`);
});