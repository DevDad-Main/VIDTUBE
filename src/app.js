import express from "express";
import cors from "cors";
import fs from "fs";
import healthCheckRouter from "./routes/healthCheck.routes.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import { errorHandler } from "./middlewares/error.middlewares.js";
import likeRouter from "./routes/like.routes.js";
import commentRouter from "./routes/comment.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

//#region CONSTANTS
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  {
    flags: "a",
  },
);

//NOTE: CORS -> Cross-Origin Resource Sharing
//NOTE: CORS is a security feature built into web browsers
//NOTE: that controls which websites are allowed to make requests to your backend server (API).

//NOTE: We have to split the string from .env as it dosent get interpreted as an array of origins
const allowedOrigins = process.env.CORS_ORIGIN.split(","); // split comma-separated string
//#endregion

//#region Express Middlewares
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["PATCH", "POST", "PUT", "GET", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Headers",
      // "Access-Control-Allow-Origin",
    ],
    credentials: true,
    // optionsSuccessStatus: 200,
  }),
);

app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

//NOTE: Allows json data to pass through, but with a limit, so it's not unlimited data
app.use(
  express.json({
    limit: "16kb",
  }),
);
//NOTE:
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  }),
);
//NOTE: Serving our static files so they can be rendered on the webpage
app.use(express.static("public"));
//NOTE: Using cookie parser so we can access our cookies
app.use(cookieParser());
//#endregion

//#region API Endpoints
//NOTE: Routes
app.use("/api/v1/healthCheck", healthCheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);

app.use(errorHandler);
//#endregion

export { app };
