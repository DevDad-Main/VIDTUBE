import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { Like } from "../models/like.models.js";

//#region Get Video Comments
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page, limit } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  const userId = req.user?._id
    ? new mongoose.Types.ObjectId(`${req.user._id}`)
    : null;

  const comments = await Comment.aggregate([
    {
      $match: { video: new mongoose.Types.ObjectId(`${videoId}`) },
    },
    { $sort: { createdAt: -1 } }, // newest first
    { $skip: (pageNum - 1) * limitNum }, // paginate early
    { $limit: limitNum },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{ $project: { password: 0, email: 0 } }],
      },
    },
    { $unwind: "$owner" },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likesList",
      },
    },
    {
      $addFields: {
        likes: { $size: "$likesList" },
        isLiked: userId ? { $in: [userId, "$likesList.likedBy"] } : false,
        isOwner: userId ? { $eq: ["$owner._id", userId] } : false,
      },
    },
    {
      $project: {
        likesList: 0, // remove raw likes array
      },
    },
  ]);

  res.status(200).json(new ApiResponse(200, comments, "Comments fetched"));
});
//#endregion

//#region Add Comment
const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  try {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }
    const newComment = new Comment({
      content: content,
      video: video,
      owner: req.user?._id,
    });
    await newComment.save();

    //NOTE: Only fetching the comment so we can populate the owner field to send to the frontend
    const comment = await Comment.findById(newComment._id).populate(
      "owner",
      "-password -email",
    );

    res.status(200).json(new ApiResponse(200, comment, "New Comment added"));
  } catch (error) {
    throw new ApiError(500, "Error adding comment", error);
  }
});
//#endregion

// const updateComment = asyncHandler(async (req, res) => {
//   // TODO: update a comment
// });

//#region Delete Comment
const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid comment id");
  }

  try {
    const commentToDelete = await Comment.findByIdAndDelete(id);

    if (!commentToDelete) {
      throw new ApiError(404, "Comment not found");
    }

    res.status(200).json(new ApiResponse(200, {}, "Comment deleted"));
    console.log(commentToDelete);
  } catch (error) {
    throw new ApiError(500, "Error deleting comment", error);
  }
});
//#endregion

export { getVideoComments, addComment, deleteComment };
