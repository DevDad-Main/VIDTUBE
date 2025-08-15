import {
  createPlaylist,
  getUserPlaylists,
} from "../controllers/playlist.controllers.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.get("/playlists", verifyJWT, getUserPlaylists);

export default router;
