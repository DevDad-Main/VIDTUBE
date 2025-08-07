import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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

//#region Genereate Access And Refresh Token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(500, "User does not exist.");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens",
    );
  }
};
//#endregion

//#region Register User
const registerUser = asyncHandler(async (req, res) => {
  //NOTE: We also have the image files aswell avatar and cover image but they get handled seperately by multer
  const { fullname, email, username, password } = req.body;

  //NOTE: Validation

  //NOTE: Handy way instead of manually checking each field in a seperate if statement etc.
  //NOTE: The some will return the first one that does not meet the requiremnets, but in our case because the server is always running
  //NOTE: We will just carry on to check if the next field is missing etc
  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields are required");
  }

  //NOTE: Check to see if the user already exists, we will import in the User from mongo that we made using mongoose
  //NOTE: We can find the user by multiple queries like .findOne({username or email etc})
  const doesUserExist = await User.findOne({
    $or: [
      {
        username,
      },
      {
        email,
      },
    ],
  });

  if (doesUserExist) {
    throw new ApiError(409, "User with email or username already exists");
  }
  console.warn(req.files);
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing.");
  }
  //NOTE: ALlowing the coverImage to optional
  // let coverImage = "";

  // const avatar = await uploadOnCloudinary(avatarLocalPath);
  // if (coverImage) {
  //   const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  // }

  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("Uploaded avatar", avatar);
  } catch (error) {
    console.log("Error uploading avatar ", error);
    throw new ApiError(500, "Failed to upload avatar.");
  }

  let coverImage;
  try {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
    console.log("Uploaded Cover Image", coverImage);
  } catch (error) {
    console.log("Error uploading avatar ", error);
    throw new ApiError(500, "Failed to upload cover image.");
  }

  try {
    const user = await User.create({
      fullname: fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    //NOTE: Extra query from the DB to make sure we are not maing a duplicate
    //NOTE: Also .select()we are specifing the data we dont want to be returned
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    if (!createdUser) {
      //NOTE: Server Error
      throw new ApiError(500, "Something went wrong while registering a user");
    }

    //NOTE: Returning a response to the front end
    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User registered successfully"));
  } catch (error) {
    console.log("User Creation Failed");

    if (avatar) {
      await deleteFromCloudinary(avatar.public_id);
    }
    if (coverImage) {
      await deleteFromCloudinary(coverImage.public_id);
    }

    throw new ApiError(
      500,
      "Something went wrong while registering a new user and image files were deleted",
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
  const { email, username, password } = req.body;

  ////NOTE: Validation
  //if (![email, username, password].some((field) => field?.trim() === "")) {
  //  throw new ApiError(400, "All Fields are required");
  //}

  const user = await User.findOne({
    $or: [
      {
        username,
      },
      {
        email,
      },
    ],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  //NOTE: Validate the password
  const isPasswordValid = await user.isPasswordValid(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid Credentials");
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
  await User.findByIdAndUpdate(
    req.user._id,
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
      .json(new ApiResponse(200, "Logout successful"))
  );
});
//#endregion

//#region Refresh Token
const refreshAccessToken = asyncHandler(async (req, res) => {
  //NOTE: This will be stored in our cookies, but could also potentially come from our body aswell
  //NOTE: If it's a mobile app then it will be coming from the body as apps dont have cookies
  const { incomingRefreshToken } =
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
  } catch (error) {}
});
//#endregion

//#region Change User Password
const changeUserPassword = asyncHandler(async (req, res) => {
  //NOTE: Find the user and then we need to access the password and get the info from the frontend
  //NOTE: then we can get the newely requested password and update our db with that password

  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(401, "Old password is incorrect");
  }
  //NOTE: We can assign it like so.
  user.password = newPassword;
  //NOTE: Then we can trigger the user.save and that triggers
  //NOTE: The pre hook we have on our user model, which saves and hashes
  //NOTE: our password
  await user.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});
//#endregion

//#region Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user details"));
});
//#endregion

//#region Update User Account Details
//NOTE: We don't have to allow updating everything, maybe specific things like, email, username etc
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, "Fullname and email are missing");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email: email,
      },
    },
    { new: true },
  ).select("-password -refreshToken");

  res
    .status(200)
    .join(new ApiResponse(200, user, "Account details updated successfully"));
});
//#endregion

//#region Update User Avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log(req.file);

  if (!avatar.url) {
    throw new ApiError(500, "Something went wrong");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true },
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});
//#endregion

//#region Update User Cover Image
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(500, "Something went wrong");
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true },
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
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
      //NOTE: Project only the neccesasry data.
      $project: {
        fullname: true, //NOTE: Can also say 1 for true or 0 for false,
        username: true,
        avatar: true,
        subscribersCount: true,
        channelsSubscribedToCount: true,
        isSubscribed: true,
        coverImage: true,
        email: true,
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
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: "videos",
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
