import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";

//#region Toggle A Video Like
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

    //NOTE: Using this DB call as then we only have to call it once, i dont like it because the syntax below looks ugly in our if block, but least we dont have to call more than once
    const video = await Video.findById(videoId);
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
//#endregion

//#region Toggle A Comment Like
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
});
//#endregion

//#region Get All Liked Videos
const getLikedVideos = asyncHandler(async (req, res) => {
  try {
    const videos = await Video.find();

    // For each video, count the likes
    const videosWithLikes = await Promise.all(
      videos.map(async (video) => {
        const likeCount = await Like.countDocuments({ video: video._id });
        return {
          ...video.toObject(), //NOTE: convert mongoose doc to plain JS object
          likes: likeCount,
        };
      }),
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          videosWithLikes,
          "All videos fetched successfully",
        ),
      );
  } catch (error) {
    throw new ApiError(500, "Error fetching video", error);
  }
});
//#endregion

export { toggleCommentLike, toggleVideoLike, getLikedVideos };
