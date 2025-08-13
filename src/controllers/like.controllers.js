import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  try {
    const existingLike = await Like.findOne({
      video: videoId,
      likedBy: req.user?._id,
    });

    const video = await Video.findById({ _id: videoId });
    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      // const updatedVideo = await Video.findByIdAndUpdate(
      //   videoId,
      //   { $inc: { likes: -1 } },
      //   { new: true },
      // );
      video.likes -= 1;
      await video.save();
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { ...video, isLiked: false },
            "Video Successfully Unliked",
          ),
        );
    } else {
      await Like.create({
        video: videoId,
        likedBy: req.user?._id,
      });
      // const updatedVideo = await video.findByIdAndUpdate(
      //   videoId,
      //   { $inc: { likes: 1 } },
      //   { new: true },
      // );
      video.likes += 1;
      await video.save();
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { ...video, isLiked: true },
            "Video Successfully Liked",
          ),
        );
    }
  } catch (error) {
    throw new ApiError(500, "Error liking video", error);
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
