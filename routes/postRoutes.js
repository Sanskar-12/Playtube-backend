import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import upload from "../middleware/multer.js";
import { createPost, getAllPosts } from "../controller/postController.js";

const router = express.Router();

router.post("/create/post", isAuth, upload.single("image"), createPost);
router.get("/get/all/posts", isAuth, getAllPosts);

export default router;
