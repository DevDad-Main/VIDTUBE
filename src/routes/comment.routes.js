import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
} from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.get("/comments/:videoId", verifyJWT, getVideoComments);
router.post("/add/:videoId", verifyJWT, addComment);
router.delete("/delete/:id", verifyJWT, deleteComment);

export default router;
