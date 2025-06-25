import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controllers.js";

//NOTE:   Using router modules in Express is all about:

//NOTE:-> Modularity – break your app into manageable chunks
//NOTE:-> Clarity – routes and logic stay clean and separate
//NOTE:-> Scalability – easy to grow your app without chaos

/**
This defines a GET route at the root path / of this router.

    When a GET request is made to /, Express will call the healthCheck function.

    .route("/") lets you chain methods (.get(), .post(), etc.) on the same path.
 */

const router = Router();

router.route("/").get(healthCheck);

export default router;
