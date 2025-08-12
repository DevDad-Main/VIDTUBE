import mongoose, { Schema } from "mongoose";
// import mongooseAggregatePaginate from "mongooseAggregatePaginate";

const videoSchema = new Schema(
  {
    videoFile: {
      url: {
        type: String,
      },
      folderId: {
        type: String,
      },
      // type: String, //Cloudinary URL
      // required: true,
    },
    thumbnail: {
      url: {
        type: String,
      },
      folderId: {
        type: String,
      },
      // type: String, // Cloudinary URL
      // required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  //NOTE: This property tells mongoose to assign createdAt nd updatedAt field to your scheme, type will be Date
  { timestamps: true },
);

// videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
