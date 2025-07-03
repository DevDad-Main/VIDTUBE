import express from "express";
import cors from "cors";
import healthCheckRouter from "./routes/healthCheck.routes.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/error.middlewares.js";

const app = express();

//NOTE: CORS -> Cross-Origin Resource Sharing
//NOTE: CORS is a security feature built into web browsers
//NOTE: that controls which websites are allowed to make requests to your backend server (API).

app.use(
  cors({
    origin: "process.env.CORS_ORIGIN",
    credentials: true,
  }),
);

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

//NOTE: Routes
app.use("/api/v1/healthCheck", healthCheckRouter);
app.use("/api/v1/users", userRouter);

app.use(errorHandler);

export { app };
