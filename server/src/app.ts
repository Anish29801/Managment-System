import express, { Application } from "express";
import cors from "cors";
import routes from "./routes";
import dotenv from "dotenv";
import initFirebase from "./model/config/conn";
import path from "path";

// Load env vars
dotenv.config();

const app: Application = express();

// Initialize Firebase Admin
initFirebase();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/", routes);

export default app;
