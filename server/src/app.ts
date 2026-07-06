import express, { Application } from "express";
import routes from "./routes";
import dotenv from "dotenv";
import connectDB from "./model/config/conn";
import path from "path";

// Load env vars
dotenv.config();

const app: Application = express();

app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/", routes);

const MONGO_URI = process.env.MONGO_URI || "";
connectDB(MONGO_URI);

export default app;
