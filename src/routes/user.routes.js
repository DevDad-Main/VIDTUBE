import { Router } from "express";
import {
  registerUser,
  logoutUser,
  loginUser,
  refreshAccessToken,
  changeUserPassword,
  getCurrentUser,
  getUserChannelProfile,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getWatchHistory,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

//NOTE:   Using router modules in Express is all about:

//NOTE:-> Modularity – break your app into manageable chunks
//NOTE:-> Clarity – routes and logic stay clean and separate
//NOTE:-> Scalability – easy to grow your app without chaos

/**
This defines a POST route at the root path /register of this router.

    When a POST request is made to /register, Express will call the healthCheck function.

    .route("/") lets you chain methods (.get(), .post(), etc.) on the same path.
 */

const router = Router();

//NOTE: Unsecured routes
//NOTE: This only means that they can be accessed by anyone.
//NOTE: And we don't need to implement the JWT here
router.route("/register").post(
  //NOTE: Using fields plural as we will want to get the Avatar and cover image from the user
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
);

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

//NOTE: Secured routes
//NOTE: Once we have verified with the JWT, then we call next() in our middleware which will pass over control to our logoutUser
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeUserPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

// As we are only uploading a single file we define it below
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/history").get(verifyJWT, getWatchHistory);
export default router;
