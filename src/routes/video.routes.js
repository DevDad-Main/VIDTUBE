import { Router } from "express";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  deleteVideo,
  updateVideo,
  getVideosBySearch,
} from "../controllers/video.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

//#region Routes
router.post(
  "/upload",
  verifyJWT,
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
  publishAVideo,
);

router.get("/feed", verifyJWT, getAllVideos);
router.get("/search", verifyJWT, getVideosBySearch);
router.get("/:videoId", verifyJWT, getVideoById);
router.delete("/:videoId", verifyJWT, deleteVideo);

router.patch("/update-video/:videoId", verifyJWT, updateVideo);
//#endregion

export default router;
