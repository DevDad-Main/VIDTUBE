import mongoose, { Schema } from "mongoose";
// import mongooseAggregatePaginate from "mongooseAggregatePaginate";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    //NOTE: Only really adding this field for the frontend so we can display extra buttons for deleting and updating commetns
    isOwner: {
      type: Boolean,
      default: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// commentSchema.plugin(mongooseAggregatePaginate);
export const Comment = mongoose.model("Comment", commentSchema);
