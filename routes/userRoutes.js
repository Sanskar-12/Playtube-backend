import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { getCurrentUser } from "../controller/userController.js";

const router = express.Router();

router.get("/get/current/user", isAuth, getCurrentUser);

export default router;
