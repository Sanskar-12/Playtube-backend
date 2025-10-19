import { isAuth } from "../middleware/isAuth.js";
import express from "express";
import { createVideo } from "../controller/videoController.js";
import upload from "../middleware/multer.js";
import { createShorts } from "../controller/shortController.js";

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

// shorts route
router.post("/create/shorts", isAuth, upload.single("shorts"), createShorts);

export default router;
