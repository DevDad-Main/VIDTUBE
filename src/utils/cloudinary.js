import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

//NOTE: We have to import dotenv manually as cloudinary returns an error
//NOTE: That it cannot find the api key, so having it in our index.js isnt enough

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath, userId) => {
  try {
    if (!localFilePath) return null;
    console.log(localFilePath);

    const response = await cloudinary.uploader.upload(localFilePath, {
      //NOTE: This is handy as it will automatically figure out the file type
      // folder: `VIDTUBE/${userId}`,
      folder: `VIDTUBE/${userId}`,
      resource_type: "auto",
    });

    console.log(`File Uploaded on Cloudinary. File SRC: ${response.url}`);

    //NOTE: Once file is uploaded, Delete it from the server
    //NOTE: Delete the file  from our server
    fs.unlinkSync(localFilePath);

    //NOTE: Returning thr response if anyone else wants to do anything with the data
    return response;
  } catch (error) {
    console.log("Error on cloudinary", error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (publicId, userId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      folder: `VIDTUBE/${userId}`,
    });
    console.log(result);
    console.log("Delete from cloudinary. Public ID: ", publicId);
  } catch (error) {
    console.log("Error deleting from cloudinary", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
