import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  subscribe,
  unSubscribe,
} from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/c")
  .get(getSubscribedChannels)
  .post(subscribe)
  .delete(unSubscribe);

router.get("/u/:subscriberId", getUserChannelSubscribers);

export default router;
