import {
  createPlaylist,
  getUserPlaylists,
  addVideoToPlaylist,
  getPlaylistById,
  deletePlaylist,
  updatePlaylist,
  removeVideoFromPlaylist,
} from "../controllers/playlist.controllers.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

//#region Get Routes
router.get("/playlists", verifyJWT, getUserPlaylists);
router.get("/p/:id", verifyJWT, getPlaylistById);
//#endregion

//#region Post Routes
router.post("/create", verifyJWT, createPlaylist);
router.post("/playlist", verifyJWT, addVideoToPlaylist);
//#endregion

//#region Patch Routes
router.patch("/update/:playlistId", verifyJWT, updatePlaylist);
//#endregion

//#region Delete Routes
router.delete("/delete/:playlistId", verifyJWT, deletePlaylist);
router.delete("/remove-video/:playlistId", verifyJWT, removeVideoFromPlaylist);
//#endregion

export default router;
