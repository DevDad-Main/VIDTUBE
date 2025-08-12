import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  uploadVideoOnCloudinary,
} from "../utils/cloudinary.js";

//#region Get All Videos
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  try {
    const videos = await Video.find()
      .skip((page - 1) * limit)
      .limit(10);

    if (!videos) {
      throw new ApiError(404, "No videos found");
    }

    res.status(200).json(new ApiResponse(200, videos, "Videos fetched"));
  } catch (error) {
    throw new ApiError(500, "Failed to fetch videos", error);
  }
  // console.log(videos);
});
//#endregion

//#region Publish a Video
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;
  // TODO: get video, upload to cloudinary, create video

  console.log(req.body);

  const videoLocalPath = req.files?.video[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video or thumbnail is missing");
  }

  try {
    const user = await User.findById(req.user?._id);

    const thumbnail = await uploadOnCloudinary(
      thumbnailLocalPath,
      user?.folderId,
    );
    const video = await uploadVideoOnCloudinary(videoLocalPath, user?.folderId);

    if (!video || !thumbnail) {
      throw new ApiError(401, "Something went wrong uploading to the cloud");
    }
    const newVideo = new Video({
      // videoFile: {
      //   url: video.secure_url,
      //   public_id: video.public_id,
      // },
      // thumbnail: {
      //   url: thumbnail.secure_url,
      //   public_id: thumbnail.public_id,
      // },
      title: title || "New Video",
      description: description,
      duration: videoLocalPath?.duration || 60,
      isPublished,
      // isPublished: isPublished == "Yes" ? true : false,
      owner: req.user,
    });

    await newVideo.save();
    newVideo.thumbnail = thumbnail
      ? {
          url: thumbnail.secure_url,
          public_id: thumbnail.public_id,
        }
      : null;
    newVideo.videoFile = video
      ? {
          url: video.secure_url,
          public_id: video.public_id,
        }
      : null;

    await newVideo.save();

    // const createdVideo = await Video.findById(newVideo._id);

    res.status(200).json(new ApiResponse(200, newVideo, "Video Published"));
  } catch (error) {
    console.log(error);

    throw new ApiError(
      500,
      "Something went wrong while publishing video",
      error.body,
    );
  }
});
//#endregion

//#region Get Video By Id
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  const video = await Video.find({
    _id: mongoose.Types.ObjectId(videoId),
  });

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res.status(200).json(new ApiResponse(200, video, "Video Retrieved"));
});
//#endregion

//#region Update Video
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description, thumbnail } = req.body;

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      title,
      description,
      thumbnail,
    },
    // new: true so it returns us the newely updated document
    { new: true },
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "Video details updated successfully"),
    );
});
//#endregion

//#region Delete Video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});
//#endregion

//#region Toggle Publish Status
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});
//#endregion

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
