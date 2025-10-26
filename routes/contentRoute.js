import { isAuth } from "../middleware/isAuth.js";
import express from "express";
import {
  addViews,
  createVideo,
  getAllVideos,
  toggleDislikes,
  toggleLikes,
  toggleSave,
} from "../controller/videoController.js";
import upload from "../middleware/multer.js";
import { createShorts, getAllShorts } from "../controller/shortController.js";

const router = express.Router();

// video routes
router.post(
  "/create/video",
  isAuth,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  createVideo
);
router.get("/get/all/videos", isAuth, getAllVideos);
router.put("/toggle/likes", isAuth, toggleLikes);
router.put("/toggle/dislikes", isAuth, toggleDislikes);
router.put("/toggle/save", isAuth, toggleSave);
router.put("/add/views", isAuth, addViews);

// shorts route
router.post("/create/shorts", isAuth, upload.single("shorts"), createShorts);
router.get("/get/all/shorts", isAuth, getAllShorts);

export default router;
