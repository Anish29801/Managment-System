import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 8000;

const server = express();

// Enable CORS before routes
server.use(cors({
  origin: "http://localhost:3000",  // explicitly allow your frontend
  methods: ["GET", "POST", "PUT", "PATCH","DELETE"],
  credentials: true
}));

// Parse JSON
server.use(express.json());

// Mount routes
server.use("/", app);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
