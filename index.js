import express from "express";
import dotenv from "dotenv";
import connectToDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import contentRouter from "./routes/contentRoute.js";
import playlistRouter from "./routes/playlistRoutes.js";
import postRouter from "./routes/postRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
const port = process.env.PORT;

connectToDB();
const app = express();

app.use(
  cors({
    origin: "https://playtube-frontend.vercel.app",
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
app.use("/api/v1", contentRouter);
app.use("/api/v1", playlistRouter);
app.use("/api/v1", postRouter);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
