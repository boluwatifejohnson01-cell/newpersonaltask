import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

export const uploadImage = async (
  imagePath: string,
  folder: string = "PersonalTaskManager", // Default folder name in cloudinary
) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder, // Organize images in folders
      resources_type: "image", // Tell cloudinary its an image
    });
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

export const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};

export default cloudinary;
