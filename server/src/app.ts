import express, { Application } from "express";
import routes from "./routes";
import dotenv from "dotenv";
import connectDB from "./mongoose/config/conn";

// Load env vars
dotenv.config();

const app: Application = express();

app.use(express.json());

app.use("/", routes);

const MONGO_URI = process.env.MONGO_URI || "";
connectDB(MONGO_URI);

export default app;
