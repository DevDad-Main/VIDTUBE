import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//#region Subscribe
const subscribe = asyncHandler(async (req, res) => {
  const { channelId } = req.body;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }

  try {
    const isSubscribedToChannel = await Subscription.find({
      channel: channelId,
      subscriber: req.user?._id,
    });

    if (!isSubscribedToChannel) {
      throw new ApiError(404, "You are not subscribed to this channel");
    }

    console.log(isSubscribedToChannel);

    const subscription = await Subscription.create({
      channel: channelId,
      subscriber: req.user?._id,
    });

    if (!subscription) {
      throw new ApiError(500, "Something went wrong on our end!");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, subscription, "Subscribed Succesfully"));
  } catch (error) {
    throw new ApiError(500, "Error subscribing", error);
  }
});
//#endregion

//#region Unsubscribe
const unSubscribe = asyncHandler(async (req, res) => {
  const { channelId } = req.body;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }

  try {
    const isSubscribedToChannel = await Subscription.find({
      channel: channelId,
      subscriber: req.user?._id,
    });

    if (!isSubscribedToChannel) {
      throw new ApiError(404, "You are not subscribed to this channel");
    }

    console.log(isSubscribedToChannel);

    const subscription = await Subscription.findOneAndDelete({
      channel: channelId,
      subscriber: req.user?._id,
    });

    if (!subscription) {
      throw new ApiError(500, "Something went wrong on our end!");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, {}, "Unsubscribed Succesfully"));
  } catch (error) {
    throw new ApiError(500, "Error subscribing", error);
  }
});
//#endregion

//#region Get User Channel Subscribers
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
});
//#endregion

//#region Get Subscribed Channels
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
});
//#endregion

export {
  subscribe,
  unSubscribe,
  getUserChannelSubscribers,
  getSubscribedChannels,
};
