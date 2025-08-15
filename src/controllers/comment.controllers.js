import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { Like } from "../models/like.models.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page, limit } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  const comments = await Comment.find({ video: videoId })
    .populate("owner", "-password -email")
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  if (!comments) {
    throw new ApiError(404, "Comments not found");
  }

  const userId = req.user?._id?.toString();

  // Add likes count and isLiked
  const commentsWithLikes = await Promise.all(
    comments.map(async (comment) => {
      const likesCount = await Like.countDocuments({ comment: comment._id });
      const isLiked = userId
        ? await Like.exists({ comment: comment._id, likedBy: userId })
        : false;

      return {
        ...comment,
        isOwner: comment.owner._id.toString() === userId,
        likes: likesCount,
        isLiked: Boolean(isLiked),
      };
    }),
  );

  res
    .status(200)
    .json(new ApiResponse(200, commentsWithLikes, "Comments fetched"));
});
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

// const updateComment = asyncHandler(async (req, res) => {
//   // TODO: update a comment
// });

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

export { getVideoComments, addComment, deleteComment };
