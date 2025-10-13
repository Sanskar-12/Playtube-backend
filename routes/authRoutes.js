import express from "express";
import upload from "../middleware/multer.js";
import {
  authWithGoogle,
  resetPassword,
  sendOtpMail,
  signIn,
  verifyOtp,
} from "../controller/authController.js";
import { signUp } from "../controller/authController.js";
import { signOut } from "../controller/authController.js";

const authRouter = express.Router();

authRouter.post("/signup", upload.single("photoUrl"), signUp);
authRouter.post("/login", signIn);
authRouter.get("/logout", signOut);
authRouter.post("/sendotp", sendOtpMail);
authRouter.post("/verifyotp", verifyOtp);
authRouter.post("/resetpassword", resetPassword);
authRouter.post("/auth/google", upload.single("photoUrl"), authWithGoogle);

export default authRouter;
