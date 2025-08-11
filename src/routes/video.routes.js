import { Router } from "express";
import { publishAVideo } from "../controllers/video.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  registerUserValidation,
  changePasswordValidation,
  updateUserDetailsValidation,
} from "../utils/validation.utils.js";

const router = Router();

router.post("/upload", verifyJWT, publishAVideo);

export default router;
