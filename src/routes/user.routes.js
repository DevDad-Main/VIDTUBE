import { Router } from "express";
import { registerUser, logoutUser } from "../controllers/user.controllers.js";
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
  registerUser
);

//NOTE: Secured routes
//NOTE: Once we have verified with the JWT, then we call next() in our middleware which will pass over control to our logoutUser
router.route("logout").post(verifyJWT, logoutUser);
export default router;
