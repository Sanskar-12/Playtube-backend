import { isAuth } from "../middleware/isAuth.js";
import express from "express";
import {
  addComment,
  addReply,
  addViews,
  createVideo,
  getAllVideos,
  getLikedVideos,
  getSavedVideos,
  toggleDislikes,
  toggleLikes,
  toggleSave,
} from "../controller/videoController.js";
import upload from "../middleware/multer.js";
import {
  addShortComment,
  addShortReply,
  addShortViews,
  createShorts,
  getAllShorts,
  getLikedShorts,
  getSavedShorts,
  toggleShortDislikes,
  toggleShortLikes,
  toggleShortSave,
} from "../controller/shortController.js";

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
router.post("/add/comment", isAuth, addComment);
router.post("/add/reply", isAuth, addReply);
router.get("/get/liked/videos", isAuth, getLikedVideos);
router.get("/get/saved/videos", isAuth, getSavedVideos);

// shorts route
router.post("/create/shorts", isAuth, upload.single("shorts"), createShorts);
router.get("/get/all/shorts", isAuth, getAllShorts);
router.put("/toggle/short/likes", isAuth, toggleShortLikes);
router.put("/toggle/short/dislikes", isAuth, toggleShortDislikes);
router.put("/toggle/short/save", isAuth, toggleShortSave);
router.put("/add/short/views", isAuth, addShortViews);
router.post("/add/short/comment", isAuth, addShortComment);
router.post("/add/short/reply", isAuth, addShortReply);
router.get("/get/liked/shorts", isAuth, getLikedShorts);
router.get("/get/saved/shorts", isAuth, getSavedShorts);

export default router;
