import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import {
  createChannel,
  getChannelData,
  getCurrentUser,
} from "../controller/userController.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.get("/get/current/user", isAuth, getCurrentUser);
router.post(
  "/create/channel",
  isAuth,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "banner",
      maxCount: 1,
    },
  ]),
  createChannel
);
router.get("/get/channel", isAuth, getChannelData);

export default router;
