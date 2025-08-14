import {
  getLikedVideos,
  toggleCommentLike,
  toggleVideoLike,
} from "../controllers/like.controllers.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.get("/liked-videos", verifyJWT, getLikedVideos);
router.post("/video/:videoId", verifyJWT, toggleVideoLike);
router.post("/like/:id", verifyJWT, toggleCommentLike);
export default router;
