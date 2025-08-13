import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page, limit } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  try {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const comments = await Comment.find({ video: videoId })
      .populate("owner", "-password -email")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    if (!comments) {
      throw new ApiError(404, "Videos not found");
    }

    console.log(comments);

    res.status(200).json(new ApiResponse(200, comments, "Comments fetched"));
  } catch (error) {}
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
    const comment = await Comment.findById(newComment._id).populate("owner");

    res.status(200).json(new ApiResponse(200, comment, "New Comment added"));
  } catch (error) {}
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
});

export { getVideoComments, addComment, updateComment, deleteComment };
