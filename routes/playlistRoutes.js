import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import {
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getSavedPlaylist,
  toggleSavePlaylist,
  updatePlaylist,
} from "../controller/playlistController.js";

const router = express.Router();

router.post("/create/playlist", isAuth, createPlaylist);
router.put("/toggle/save/playlist", isAuth, toggleSavePlaylist);
router.get("/get/saved/playlist", isAuth, getSavedPlaylist);
router.get("/get/playlist/:playlistId", isAuth, getPlaylistById);
router.put("/update/playlist/:playlistId", isAuth, updatePlaylist);
router.delete("/delete/playlist/:playlistId", isAuth, deletePlaylist);

export default router;
