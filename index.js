import express from "express";
import dotenv from "dotenv";
import connectToDB from "./config/db.js";

dotenv.config();
const port = process.env.PORT;

connectToDB();
const app = express();

app.get("/", (req, res) => {
  res.send("Hello from server");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
