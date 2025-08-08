import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

//#region User Schema
const userSchema = new Schema(
  {
    //NOTE: We also not like Postgresql don't need to define an id with primarykey etc
    //NOTE: as Mongo automatically aassigns one upon creation _id etc

    //NOTE: Instead of just assigning the string type, we can also define objects with alot more properties
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //Cloudinary URL
      required: true,
    },
    coverImage: {
      type: String, //Cloudinary URL
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String, //NOTE: Won't be a plain string, it will be encrypted, maybe salting and hashing?
      required: [true, "password is required"], //NOTE: We require the password obviously but then we send over a message to front end
    },
    refreshToken: {
      type: String,
    },
  },
  //NOTE: This property tells mongoose to assign createdAt nd updatedAt field to your scheme, type will be Date
  { timestamps: true },
);
//#endregion

//#region Generate Access Token
//NOTE: Whenever the user has logged in we will send a refresh token and access token.
//NOTE: JWT Tokens
userSchema.method("generateAccessToken", function () {
  //NOTE: Short lived access token -> We will define the expiry time
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  );
});
//#endregion

//#region Generate Refresh Token
userSchema.method("generateRefreshToken", function () {
  //NOTE: Short lived access token -> We will define the expiry time
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  );
});
//#endregion

//NOTE: Mongoose will go ahead and a create a document with this structure.
//NOTE: If this document doesn't exist, it will create it.
//NOTE: The structure it should follow is the userSchema
export const User = mongoose.model("User", userSchema);
