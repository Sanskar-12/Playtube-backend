import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (filePath) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    if (!filePath) return null;

    // If it's already an online URL (e.g., Google photo), just return it
    if (filePath.startsWith("http")) {
      return filePath;
    }

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    // Delete local file only if it exists locally
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result.secure_url;
  } catch (error) {
    console.log(error);

    if (fs.existsSync(filePath) && !filePath.startsWith("http")) {
      fs.unlinkSync(filePath);
    }
  }
};

export default uploadOnCloudinary;
