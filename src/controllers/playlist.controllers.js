import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";

//#region Create Playlist
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  try {
    const loggedInUser = await User.findById(req.user?._id);

    if (!loggedInUser) {
      throw new ApiError(404, "User not found");
    }

    const exisitingPlaylist = await Playlist.findOne({ name: name });

    if (exisitingPlaylist) {
      throw new ApiError(400, "Playlist with that name already exists");
    }

    const newPlaylist = new Playlist({
      name,
      description,
      owner: loggedInUser,
    });

    await newPlaylist.save();

    return res.status(201).json(new ApiResponse(201, newPlaylist, "Created"));
  } catch (error) {
    throw new ApiError(500, "Error creating playlist", error);
  }

  //TODO: create playlist
});
//#endregion

//#region Get Users Playlists
const getUserPlaylists = asyncHandler(async (req, res) => {
  // const { userId } = req.params;
  //
  // if (!isValidObjectId(userId)) {
  //   throw new ApiError(400, "Invalid user id");
  // }

  try {
    const loggedInUser = await User.findById(req.user?._id);
    const userPlaylists = await Playlist.find({
      owner: loggedInUser._id,
    }).populate("videos", "-password -email");

    if (!userPlaylists) {
      throw new ApiError(404, "No Playlists found for this user");
    }
    if (!loggedInUser) {
      throw new ApiError(404, "User not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, userPlaylists, "Fetched User Playlists"));
  } catch (error) {
    throw new ApiError(500, "Error getting user", error);
  }

  //TODO: get user playlists
});
//#endregion

//#region Get Playlist By Id
const getPlaylistById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  //TODO: get playlist by id

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  try {
    const playlist = await Playlist.findById(id).populate("videos");
    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(new ApiResponse(200, playlist, "Fetched Playlist"));
  } catch (error) {
    throw new ApiError(500, "Error getting playlist", error);
  }
});
//#endregion

//#region Add Video To Playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistName, videoId } = req.body;
  if (!isValidObjectId(videoId)) {
    console.log(videoId);
    throw new ApiError(400, "Invalid video id");
  }

  try {
    const video = await Video.findById(videoId);
    const playlist = await Playlist.findOne({ name: playlistName });

    if (!video) {
      throw new ApiError(404, "Video Not Found");
    }
    if (!playlist) {
      throw new ApiError(404, "Playlist Not Found");
    }

    playlist.videos.push(video);
    await playlist.save();

    res.status(200).json(new ApiResponse(200, playlist, "Video added"));
  } catch (error) {}
});
//#endregion

//#region Remove Video From Playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { videoId } = req.body;

  if (!isValidObjectId(videoId) || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid video or playlist id");
  }

  try {
    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    playlist.videos.pull(video);
    await playlist.save();

    res.status(200).json(new ApiResponse(200, playlist, "Video removed"));
  } catch (error) {
    throw new ApiError(500, "Error removing video from playlist", error);
  }
});
//#endregion

//#region Delete Playlist
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  try {
    const playlistToDelete = await Playlist.findByIdAndDelete(playlistId);

    if (!playlistToDelete) {
      throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(new ApiResponse(200, {}, "Playlist deleted"));
  } catch (error) {
    throw new ApiError(500, "Error deleting playlist", error);
  }
});
//#endregion

//#region Update Playlist
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  try {
    const playlist = await Playlist.findById(playlistId);

    playlist.name = name;
    playlist.description = description;

    await playlist.save();

    return res.status(200).json(new ApiResponse(200, playlist, "Updated"));
  } catch (error) {
    throw new ApiError(500, "Error updating playlist", error);
  }
});
//#endregion

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
