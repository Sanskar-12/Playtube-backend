import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import upload from "../middleware/multer.js";
import {
  createPlaylist,
  getSavedPlaylist,
  toggleSavePlaylist,
} from "../controller/playlistController.js";

const router = express.Router();

router.post("/create/playlist", isAuth, createPlaylist);
router.put("/toggle/save/playlist", isAuth, toggleSavePlaylist);
router.get("/get/saved/playlist", isAuth, getSavedPlaylist);

export default router;
