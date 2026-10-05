import express from "express";
import { admin, protect } from "../middlewares/authMiddleware";
import {
  getProfile,
  login,
  register,
  updateAvatar,
  updateProfile,
} from "../controller/userController";
import { uploadImage } from "../config/cloudinary";
import upload from "../middlewares/uploadMiddleware";

const router = express.Router();

// // Applying protect and admin here so user can log in and admin can be set
// router.use(protect, admin);

// POST /api/register creates new account
router.post("/register", register);

//post /api/login sign in and receive a token
router.post("/login", login);

// protected routes -- must send a valid JWT token in the Authorization header
//GET /api/profile - view your own profile
router.get("/profile", protect, getProfile);

// PUT /api/profile -- update name, phone address or password
router.put("/profile", protect, updateProfile);

//POST api/avatar -- upload a new profile picture
router.post("/avatar", protect, upload.single("avatar"), updateAvatar); // "upload.single("avatar") means Multer will look for a field named "avatar" in the form

export default router;
