import { isAuth } from "../middleware/isAuth.js";
import express from "express";
import {
  addComment,
  addReply,
  addViews,
  createVideo,
  deleteVideo,
  getAllVideos,
  getLikedVideos,
  getSavedVideos,
  getVideoById,
  toggleDislikes,
  toggleLikes,
  toggleSave,
  updateVideo,
} from "../controller/videoController.js";
import upload from "../middleware/multer.js";
import {
  addShortComment,
  addShortReply,
  addShortViews,
  createShorts,
  deleteShort,
  fetchShort,
  getAllShorts,
  getLikedShorts,
  getSavedShorts,
  toggleShortDislikes,
  toggleShortLikes,
  toggleShortSave,
  updateShort,
} from "../controller/shortController.js";
import {
  filterCategoryWithAi,
  searchWithAi,
} from "../controller/aiController.js";

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
router.get("/get/video/:videoId", isAuth, getVideoById);
router.put(
  "/update/video/:videoId",
  upload.single("thumbnail"),
  isAuth,
  updateVideo
);
router.delete("/delete/video/:videoId", isAuth, deleteVideo);

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
router.get("/get/short/:shortId", isAuth, fetchShort);
router.put("/update/short/:shortId", upload.none(), isAuth, updateShort);
router.delete("/delete/short/:shortId", isAuth, deleteShort);

// ai route
router.post("/search", isAuth, searchWithAi);
router.post("/filter/category", isAuth, filterCategoryWithAi);

export default router;
