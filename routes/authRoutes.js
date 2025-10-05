import express from "express";
import upload from "../middleware/multer.js";
import { signIn } from "../controller/authController.js";
import { signUp } from "../controller/authController.js";
import { signOut } from "../controller/authController.js";

const authRouter = express.Router();

authRouter.post("/signup", upload.single("photoUrl"), signUp);
authRouter.post("/login", signIn);
authRouter.get("/logout", signOut);

export default authRouter;
