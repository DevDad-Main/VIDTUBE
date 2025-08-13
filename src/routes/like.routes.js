import {
  getLikedVideos,
  toggleVideoLike,
} from "../controllers/like.controllers.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/video/:videoId", verifyJWT, toggleVideoLike);
router.get("/video/:videoId", verifyJWT, getLikedVideos);

export default router;
