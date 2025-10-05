import express from "express";
import dotenv from "dotenv";
import connectToDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";

dotenv.config();
const port = process.env.PORT;

connectToDB();
const app = express();

app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from server");
});
app.use("/api/v1", authRouter);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
