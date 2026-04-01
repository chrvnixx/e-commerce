import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser())
app.use("/api/auth", authRoutes);

app.listen(port, () => {
  connectDb();
  console.log(`Server is running on http://localhost:${port}`);
});
