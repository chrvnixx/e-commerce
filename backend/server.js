import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import connectDb from "./config/db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(port, () => {
  connectDb();
  console.log(`Server is running on http://localhost:${port}`);
});
