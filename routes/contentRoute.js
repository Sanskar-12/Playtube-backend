import { isAuth } from "../middleware/isAuth.js";
import express from "express";
import { createVideo } from "../controller/videoController.js";
import upload from "../middleware/multer.js";

const router = express.Router();

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

export default router;
