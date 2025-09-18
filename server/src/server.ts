import dotenv from "dotenv";
import app from "./app";
import cors from "cors";
import corsOptions from "./cors/corsConfig";

dotenv.config();

const PORT = process.env.PORT || 8000;



app.use(cors(corsOptions));


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
