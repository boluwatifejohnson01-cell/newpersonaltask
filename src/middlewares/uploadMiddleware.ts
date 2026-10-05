// Sets up multer for handling file uploads (images)
// Multer is a Node.js middleware for handling multiparts/form data/uploads to thirdparty websites etc
// instead of saving files to mongodb, we use memory storage and then upload directly to cloudinary

import multer from "multer";
import { Request } from "express";

// memoryStorage keeps the file in RAM as a buffer (binary data)
// This is better than saving to database/disk when we're uploading to cloudinary
const storage = multer.memoryStorage();

// file filter - only allow image files
// This runs for every file upload attempts
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void => {
  //check if the files MIME type starts with "image/" e.g, "image/jpeg", "image/png", "image/webp"
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // null = no error, true = accept the file
  } else {
    // reject non-images files
    cb(new Error("Only images files are allowed"));
  }
};

// Creates the multer upload instance with our settings
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Max 5MB per file (5 * 1024 * 1024 bytes)
  },
});

export default upload;
