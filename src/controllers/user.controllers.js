import { asyncHandler } from "../utils/asyncHandler.js";
import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { SALT_ROUNDS } from "../constants.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

dotenv.config();

//#region Get Users
const getUsers = asyncHandler(async (req, res) => {
  //TODO: Get all users
  const users = await User.find();
  // const users = await User.find().select("username email fullname");

  if (!users) {
    throw new ApiError(404, "No users found");
  }

  console.log(users);

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Fetched all users successfully"));
});
//#endregion

//#region Generate Access And Refresh Token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(500, "User does not exist.");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // console.log(accessToken, refreshToken);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens",
      error,
    );
  }
};
//#endregion

//#region Register User
const registerUser = asyncHandler(async (req, res) => {
  //NOTE: We also have the image files aswell avatar and cover image but they get handled seperately by multer

  const errors = validationResult(req);
  const { fullname, email, username, password } = req.body;

  if (!errors.isEmpty()) {
    throw new ApiError(400, "Error validating user input", errors.array());
  }

  //#region Old Validation Code
  ////NOTE: Check to see if the user already exists, we will import in the User from mongo that we made using mongoose
  ////NOTE: We can find the user by multiple queries like .findOne({username or email etc})
  //const doesUserExist = await User.findOne({
  //  $or: [
  //    {
  //      username,
  //    },
  //    {
  //      email,
  //    },
  //  ],
  //});
  //
  //if (doesUserExist) {
  //  throw new ApiError(
  //    409,
  //    "User with email or username already exists",
  //    // !errors.isEmpty() ? errors.array() : "",
  //  );
  //}
  //#endregion

  console.warn(req.files);
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  // NOTE: ALlowing the coverImage and avatar to default and then user can update this later in settings.
  // NOTE: This will allow us split the users images into seperate files using their ids
  // let coverImage = "";

  // if (!avatarLocalPath) {
  //   throw new ApiError(400, "Avatar file is missing.");
  // }

  // const avatar = await uploadOnCloudinary(avatarLocalPath);
  // if (coverImage) {
  //   const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  // }

  let avatar;
  let coverImage;

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({
      fullname: fullname,
      email: email,
      password: hashedPassword,
      username: username.toLowerCase(),
    });

    //#region Old Query for checking if user exists
    //NOTE: Extra query from the DB to make sure we are not maing a duplicate
    //NOTE: Also .select()we are specifing the data we dont want to be returned
    // const createdUser = await User.findById(user._id).select(
    //   "-password -refreshToken",
    // );
    //
    // if (!createdUser) {
    //   //NOTE: Server Error
    //   throw new ApiError(500, "Something went wrong while registering a user");
    // }
    //#endregion

    //NOTE: We save now so we save the main user data to our db and then we store our folderId in our pre save hook. Accessible below for the image uploads
    await user.save();

    //#region Avatar Upload -> They can be not set by default
    try {
      avatar = await uploadOnCloudinary(avatarLocalPath, user.folderId);
      console.log("Uploaded avatar", avatar);
    } catch (error) {
      console.log("Error uploading avatar ", error);
      throw new ApiError(500, "Failed to upload avatar.");
    }
    //#endregion

    //#region Cover Image Upload -> They can be not set by default
    try {
      coverImage = await uploadOnCloudinary(coverImageLocalPath, user.folderId);
      console.log("Uploaded Cover Image", coverImage);
    } catch (error) {
      console.log("Error uploading avatar ", error);
      throw new ApiError(500, "Failed to upload cover image.");
    }
    //#endregion

    // user.avatar = avatar?.url || "";
    user.avatar = avatar
      ? {
          url: avatar.secure_url,
          public_id: avatar.public_id,
        }
      : null;

    user.coverImage = coverImage
      ? {
          url: coverImage.secure_url,
          public_id: coverImage.public_id,
        }
      : null;
    // user.coverImage = coverImage?.url || "";

    await user.save();
    //NOTE: Returning a response to the front end
    return res
      .status(201)
      .json(new ApiResponse(200, user, "User registered successfully"));
  } catch (error) {
    console.log("User Creation Failed: ", error);

    if (avatar) {
      await deleteFromCloudinary(avatar.public_id);
    }
    if (coverImage) {
      await deleteFromCloudinary(coverImage.public_id);
    }

    throw new ApiError(
      500,
      "Something went wrong while registering a new user and image files were deleted",
      error,
    );
  }
});
//#endregion

//#region Login User
const loginUser = asyncHandler(async (req, res) => {
  //NOTE: Get data from the body.

  // const email = req.body.email;
  // const username = req.body.username;
  // const password = req.body.password;
  const { username, password } = req.body;

  ////NOTE: Validation
  //if (![email, username, password].some((field) => field?.trim() === "")) {
  //  throw new ApiError(400, "All Fields are required");
  //}

  const user = await User.findOne({ username: username });
  // const user = await User.findOne({ $or: [
  //     {
  //       username,
  //     },
  // {
  //   email,
  // },
  //   ],
  // });

  console.log(user);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  console.log(user.password);
  //NOTE: Validate the password
  const isPassValid = await bcrypt.compare(password, user.password);

  if (!isPassValid) {
    throw new ApiError(400, "Invalid Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    //NOTE: Handy for development process but the variable gets set dynamically depending on it's state
    secure: process.env.NODE_ENV === "production",
  };

  return (
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      //NOTE: Refresh token is only normally set in the cookie
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "User logged in successfully",
        ),
      )
  );
});
//#endregion

//#region Logout User
const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      //NOTE: Allows us to set and change any property, in this case it will be the refresh token
      $set: {
        refreshToken: undefined, // NOTE: Depending on the MongoDB version, we can use "" empty string or null or undefined
      },
    },

    { new: true }, //NOTE: Returns us the updated user
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return (
    res
      .status(200)
      //NOTE: Using a method called .clearCookie allowing us to clear the cookies one by one
      .clearCookie("accessToken", options)
      //NOTE: Using a method called .clearCookie allowing us to clear the cookies one by one
      .clearCookie("refreshToken", options)
      //NOTE: Here we just send the default 200 resonse
      .json(new ApiResponse(200, user, "Logout successful"))
  );
});
//#endregion

//#region Refresh Token
const refreshAccessToken = asyncHandler(async (req, res) => {
  //NOTE: This will be stored in our cookies, but could also potentially come from our body aswell
  //NOTE: If it's a mobile app then it will be coming from the body as apps dont have cookies
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    //NOTE: If this token can be decoded, then we have acces to the information of the _id.
    //NOTE: This might not always return an id so we add the ?. null check
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    //NOTE: we got here now we are sure that everything is good and passed checks
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully",
        ),
      );
  } catch (error) {
    console.log(error);
  }
});
//#endregion

//#region Change User Password
const changeUserPassword = asyncHandler(async (req, res) => {
  //NOTE: Find the user and then we need to access the password and get the info from the frontend
  //NOTE: then we can get the newely requested password and update our db with that password

  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Old password is incorrect");
  }

  // Check if the passwords are the same otherwise return an error
  if (oldPassword === newPassword) {
    throw new ApiError(400, "New password must be different from old password");
  }

  //WARN: Rehash password before saving back to the DB
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  user.password = hashedPassword;
  const updatedPassword = await user.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});
//#endregion

//#region Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    console.log(user);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          user,
          `Currently logged in user: ${req.user.username}`,
        ),
      );
  } catch (err) {
    console.log(err);
  }
});
//#endregion

//#region Update User Account Details
//NOTE: We don't have to allow updating everything, maybe specific things like, email, username etc
const updateAccountDetails = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  const { fullname, email } = req.body;

  console.log(req.body);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Error validating user input", errors.array());
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname: fullname,
        email: email,
      },
    },
    { new: true },
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});
//#endregion

//#region Update User Avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is missing");
  }

  const loggedInUser = await User.findById(req.user?._id).select(
    "avatar folderId",
  );

  if (!loggedInUser) {
    throw new ApiError(404, "User not found");
  }

  console.log("Logged in User: ", loggedInUser);

  let newAvatar;
  try {
    newAvatar = await uploadOnCloudinary(
      avatarLocalPath,
      loggedInUser.folderId,
    );
    console.log("New Avatar: ", newAvatar);
    if (!newAvatar.secure_url || !newAvatar.public_id) {
      throw new ApiError(500, "Something went wrong retrieving avatar details");
    }
    console.log(req.file);

    if (loggedInUser.avatar?.public_id) {
      try {
        await deleteFromCloudinary(loggedInUser.avatar.public_id);
      } catch (error) {
        console.warn("Failed to delete old avatar from Cloudinary");
      }
    }

    loggedInUser.avatar = {
      url: newAvatar.secure_url,
      public_id: newAvatar.public_id,
    };

    await loggedInUser.save();
  } catch (err) {
    throw new ApiError(500, "Failed to update user avatar");
  }

  res
    .status(200)
    .json(new ApiResponse(200, loggedInUser, "Avatar updated successfully"));
});
//#endregion

//#region Update User Cover Image
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image is missing");
  }

  const loggedInUser = await User.findById(req.user?._id).select(
    "coverImage folderId",
  );

  if (!loggedInUser) {
    throw new ApiError(404, "User not found");
  }

  let newCoverImage;
  try {
    newCoverImage = await uploadOnCloudinary(
      coverImageLocalPath,
      loggedInUser.folderId,
    );
    if (!newCoverImage.secure_url || !newCoverImage.public_id) {
      throw new ApiError(
        500,
        "Something went wrong retrieving cover image details",
      );
    }

    if (loggedInUser.coverImage?.public_id) {
      try {
        await deleteFromCloudinary(loggedInUser.coverImage.public_id);
      } catch (error) {
        console.warn("Failed to delete old cover image from Cloudinary");
      }
    }

    loggedInUser.coverImage = {
      url: newCoverImage.secure_url,
      public_id: newCoverImage.public_id,
    };

    await loggedInUser.save();
  } catch (err) {
    throw new ApiError(500, "Failed to update user coverImage");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, loggedInUser, "Cover image updated successfully"),
    );
});
//#endregion

//#region Get User Channel Profile
const getUserChannelProfile = asyncHandler(async (req, res) => {
  //NOTE: Returns us data from the url
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $lookup: {
        from: "videos", // Collection name you're joining FROM
        localField: "_id", // Field in the *current* collection
        foreignField: "owner", // Field in the 'from' collection
        as: "videos", // Name of the new array field to store matches
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subscribers.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      //NOTE: Project only the necessary data.
      $project: {
        fullname: true, //NOTE: Can also say 1 for true or 0 for false,
        username: true,
        avatar: true,
        subscribersCount: true,
        channelsSubscribedToCount: true,
        isSubscribed: true,
        coverImage: true,
        email: true,
        videos: true,
      },
    },
  ]);

  console.log(channel);

  if (!channel?.length) {
    throw new ApiError(404, "Channel not found");
  }

  return res.status(200).json(new ApiResponse(200, channel[0]));
});
//#endregion

//#region Get Watch History
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(`${req.user?._id}`),
      },
    },

    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  if (!user) {
    throw new ApiError(400, "User Not Found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0]?.watchHistory,
        "Watch history fetched successfully",
      ),
    );
});
//#endregion

export {
  getUsers,
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changeUserPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
