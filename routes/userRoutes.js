import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import {
  addHistory,
  addOrRemoveSubscribers,
  createChannel,
  getAllChannelData,
  getChannelData,
  getCurrentUser,
  getHistory,
  getSubscribedData,
  updateChannel,
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
router.put(
  "/update/channel",
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
  updateChannel
);
router.get("/get/channel", isAuth, getChannelData);
router.post("/add/or/remove/subscribers", isAuth, addOrRemoveSubscribers);
router.get("/get/all/channels", isAuth, getAllChannelData);
router.get("/get/all/subscribed/data", isAuth, getSubscribedData);
router.post("/add/history", isAuth, addHistory);
router.get("/get/history", isAuth, getHistory);

export default router;
