import dotenv from "dotenv";
import app from "./app";

// Load env vars
dotenv.config();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
