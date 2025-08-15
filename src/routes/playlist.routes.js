import {
  createPlaylist,
  getUserPlaylists,
  addVideoToPlaylist,
  getPlaylistById,
  deletePlaylist,
} from "../controllers/playlist.controllers.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.get("/playlists", verifyJWT, getUserPlaylists);
router.post("/create", verifyJWT, createPlaylist);
router.post("/playlist", verifyJWT, addVideoToPlaylist);
router.get("/p/:id", verifyJWT, getPlaylistById);
router.delete("/delete/:playlistId", verifyJWT, deletePlaylist);

export default router;
