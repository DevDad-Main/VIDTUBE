import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
      type: String, //NOTE: Won't be a plain string, it wiill be encrypted, maybe salting and hashing?
      required: [true, "password is required"], //NOTE: We Requirethe password obviously but then we send over a message to front end
    },
    refreshToken: {
      type: String,
    },
  },
  //NOTE: This property tells mongoose to assign createdAt nd updatedAt field to your scheme, type will be Date
  { timestamps: true }
);

//NOTE: We want to before we store our users details we want to encrpyt there data, this could be with hashing and salting.
//NOTE: We shall do this with the npm plugin bcrypt

//NOTE: Using next here so we can pass on our data to the next middleware or finally wherever it needs to go
userSchema.pre("save", async function (next) {
  //NOTE: If the password is not the thing being modified then we move onto the next middleware etc
  //NOTE: This ensures we are not always modified or updating the password when we don't need to or doing something else
  //NOTE: Also the first time we store this password we are not modifying an exisiting field, so this will never run
  if (!this.isModified("password")) return next();

  //NOTE: Using bycrypt to has this password and salt it with 10 rounds
  this.password = bcrypt.hash(this.password, 10);

  next();
});

//NOTE: Returns a true or false wether the password is correct or not
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//NOTE: Wheneevr the user has logged in we will send a refresh token and access token.
//NOTE: JWT Tokens

userSchema.methods.generateAccessToken = function () {
  //NOTE: Short lived access token -> We will define the expiry time
  jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  //NOTE: Short lived access token -> We will define the expiry time
  jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};
//NOTE: Mongoose will go ahead and a create a document with this structure.
//NOTE: If this document dosent exist, it will create it.
//NOTE: The structure it should follow is the userSchema
export const User = mongoose.model("User", userSchema);
//NOTE: So we can import the model and have access to like querying, finding elements
//NOTE: When we also export this we will get all the featuresthat mongoose has
//NOTE: Saving more data to the database
