import express from "express";
import dotenv from "dotenv";
import connectToDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
const port = process.env.PORT;

connectToDB();
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from server");
});
app.use("/api/v1", authRouter);
app.use("/api/v1", userRouter);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
