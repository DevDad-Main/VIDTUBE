import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectID,
      ref: "User",
    },
    comment: {
      type: Schema.Types.ObjectID,
      ref: "Comment",
    },
    tweet: {
      type: Schema.Types.ObjectID,
      ref: "Tweet",
    },
    likedBy: {
      type: Schema.Types.ObjectID,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);
