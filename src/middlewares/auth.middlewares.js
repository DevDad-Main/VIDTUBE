import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//NOTE: Leaving response as empty since we are not sending anything
//NOTE: Using next as we want to transfer the flow onto the next controller.
//NOTE: Next is important to execute what we want to do next
export const verifyJWT = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      " -password refreshToken",
    );

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    //NOTE: Not default in Node.js or express, but comes from middleware like passport or JWT which we are Using
    //NOTE: Once we have decoded the token above then we manually attach the user from our DB to this request.user
    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
