import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
  console.log(videos);
});
//#endregion

//#region Publish a Video
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  const thumbnailLocalPath = req.files?.thumbail?.[0]?.path;
  let newThumbnail;
  try {
    const newVideo = new Video({
      // thumbnail: thumbnail,
      title: title,
      description: description,
      isPublished: true,
      owner: req.user,
    });

    try {
      newThumbnail = await uploadOnCloudinary(
        thumbnailLocalPath,
        req.user?.folderId,
      );
      console.log("Uploaded video thumnail", newThumbnail);
    } catch (error) {
      console.log("Error uploading thumbnail", error);
      throw new ApiError(500, "Failed to upload thumbnail.");
    }

    newVideo.thumbnail = newThumbnail
      ? {
          url: newThumbnail.secure_url,
          public_id: newThumbnail.public_id,
        }
      : null;

    await newVideo.save();

    res.status(200).json(new ApiResponse(200, newVideo, "Video Published"));
  } catch (error) {
    console.log(error);

    throw new ApiError(
      500,
      "Something went wrong while publishing video",
      error,
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
