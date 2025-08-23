import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  uploadVideoOnCloudinary,
} from "../utils/cloudinary.js";
import { escapeRegex } from "../utils/validation.utils.js";

//#region Get All Videos
const getAllVideos = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  //TODO: get all videos based on query, sort, pagination
  try {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 5;

    const videos = await Video.find()
      .populate("owner", "-password, -email")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    if (!videos) {
      throw new ApiError(404, "No videos found");
    }

    const totalVideos = await Video.countDocuments();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          videos,
          totalPages: Math.ceil(totalVideos / limitNum),
          currentPage: pageNum,
        },
        "Videos fetched",
      ),
    );
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

  // console.log(req.body);

  const videoLocalPath = req.files?.video[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  console.log(videoLocalPath);

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video or thumbnail is missing");
  }

  console.log("Video Path INFO: ", videoLocalPath);

  try {
    const user = await User.findById(req.user?._id);

    const thumbnail = await uploadOnCloudinary(
      thumbnailLocalPath,
      user?.folderId,
    );
    const video = await uploadVideoOnCloudinary(videoLocalPath, user?.folderId);

    console.log("VIDEO", video);

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
      duration: video.duration || 60,
      isPublished: isPublished,
      owner: user,
    });

    await newVideo.save();
    newVideo.thumbnail = thumbnail
      ? {
          url: thumbnail.secure_url,
          folderId: thumbnail.public_id,
        }
      : null;
    newVideo.videoFile = video
      ? {
          url: video.secure_url,
          folderId: video.public_id,
        }
      : null;

    await newVideo.save();

    // const createdVideo = await Video.findById(newVideo._id);

    return res
      .status(200)
      .json(new ApiResponse(200, newVideo, "Video Published"));
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

  try {
    const loggedInUser = await User.findById(req.user?._id);

    const video = await Video.findById({ _id: videoId }).populate(
      "owner",
      "-password -email",
    );

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    console.log("Video views before: ", video?.views);

    //Add a view to the video, we later can implement a similiar mechanic to youtube where the user can only add a view every 3-5min of leaving and revisiting the video
    video.views += 1;
    await video.save();

    console.log("Video views after: ", video?.views);
    const isOwner =
      video.owner._id.toString() === loggedInUser._id.toString() ? true : false;

    if (!isOwner) {
      loggedInUser.watchHistory.push(video._id);
      await loggedInUser.save();
      console.log(loggedInUser.watchHistory);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { ...video, isOwner }, "Video Retrieved"));
  } catch (error) {
    throw new ApiError(500, "Error fetching video", error);
  }
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

  try {
    const videoToDelete = await Video.findByIdAndDelete({ _id: videoId });

    //Send empty data but optionally could send back the video to delete if the front end wants to display some info etc, or maybe add to extra database for deletd videos etc
    return res.status(200).json(new ApiResponse(200, {}, "Video deleted"));
  } catch (error) {
    throw new ApiError(500, "Error deleting video", error);
  }
});
//#endregion

//#region Toggle Publish Status
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});
//#endregion

//#region Get Videos By Search
const getVideosBySearch = asyncHandler(async (req, res) => {
  const { query } = req.query;

  try {
    const safeQuery = escapeRegex(query);
    if (!safeQuery) {
      throw new ApiError(400, "Query required");
    }

    const videos = await Video.find({
      title: { $regex: safeQuery, $options: "i" }, // case-insensitive search
    })
      .limit(10)
      .populate("owner", "-password -email");

    return res.status(200).json(new ApiResponse(200, videos, "Videos Fetched"));
  } catch (err) {
    throw new ApiError(500, "Error getting videos", err);
  }
});
//#endregion

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getVideosBySearch,
};
