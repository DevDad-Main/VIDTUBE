import { Router } from "express";
import {
  getUsers,
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
import { registerUserValidation } from "../utils/validation.utils.js";

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

//#region Unsecured routes
//NOTE: This only means that they can be accessed by anyone.
//NOTE: And we don't need to implement the JWT here
router.post(
  "/register",
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
  registerUserValidation,
  registerUser,
);
router.get("/all-users", getUsers);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
//#endregion

//#region Secured Routes
//NOTE: Secured routes
//NOTE: Once we have verified with the JWT, then we call next() in our middleware which will pass over control to our logoutUser
router.route("/logout").post(verifyJWT, logoutUser);
router.post("/change-password", verifyJWT, changeUserPassword);
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
//#endregion

export default router;
