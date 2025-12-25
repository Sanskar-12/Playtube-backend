import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import upload from "../middleware/multer.js";
import {
  addPostComment,
  addPostReply,
  createPost,
  deletePost,
  getAllPosts,
  togglePostLikes,
} from "../controller/postController.js";

const router = express.Router();

router.post("/create/post", isAuth, upload.single("image"), createPost);
router.get("/get/all/posts", isAuth, getAllPosts);
router.put("/toggle/post/likes", isAuth, togglePostLikes);
router.post("/add/post/comment", isAuth, addPostComment);
router.post("/add/post/reply", isAuth, addPostReply);
router.delete("/delete/post/:postId", isAuth, deletePost);

export default router;
