import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 8000;

const server = express();

// Enable CORS before routes
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];
server.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

// Parse JSON
server.use(express.json());

// Mount routes
server.use("/", app);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
