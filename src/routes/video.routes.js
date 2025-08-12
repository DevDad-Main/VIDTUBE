import { Router } from "express";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  deleteVideo,
  updateVideo,
} from "../controllers/video.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  registerUserValidation,
  changePasswordValidation,
  updateUserDetailsValidation,
} from "../utils/validation.utils.js";

const router = Router();

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

router.get("/:videoId", verifyJWT, getVideoById);
router.delete("/:videoId", verifyJWT, deleteVideo);

router.patch("/update-video/:videoId", verifyJWT, updateVideo);

export default router;
