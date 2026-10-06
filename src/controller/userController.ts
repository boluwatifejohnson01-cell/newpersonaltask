import { Request, Response } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/indexServer";
import { uploadImage, deleteImage } from "../config/cloudinary";

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "3d",
  });
};

//--- REGISTER----
// POST /api/auth/register
// Creates a new user account
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    //Basic validation = chexk all required fields are present
    if (!name || !email || !password) {
      res
        .status(400)
        .json({ message: "Please provide name, email and password" });
      return;
    }

    // Check if a user with this email already exist
    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      res
        .status(400)
        .json({ message: "An account with this email already exists" });
      return;
    }

    // create the user - the pre-save hook user.ts will hash the password
    const user = await User.create({ name, email, password });

    // Respond with user data and a token
    res.status(201).json({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      avatar: user.avatar,
      token: generateToken(user._id.toString()), //json web token used to generate token
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "server error during registration" });
  }
};

// ----- LOGIN ----
// POST /api/auth/login
// Authenticates a user and returns a tokens
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Please provide email and password" });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    //check user exists and password match
    // user.matchPassword is defined on the user model

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
        token: generateToken(user._id.toString()),
      });
    } else {
      // use a vague error message for security
      // (dont tell hackers whether the email or password is wrong)
      res.status(401).json({ message: "invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "server error during login" });
  }
};

// ---- GET PROFILE-----
// GET /api/profile
// REturns the logged-in users profile (requires token)
export const getProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // req.user is set by the "protect" middleware
    const user = await User.findById(req.user!._id).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// --- UPDATE PROFILE------
// PUT /api/profile
// Updates users name, phone or address
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Only update fields that were actually sent in the request
    // "?? user.name" means (if req.body.name is null/undefined, keep old value)
    user.name = req.body.name ?? user.name;

    // Handle password change - only if a new password is provided
    if (req.body.password) {
      if (req.body.password.length < 8) {
        res
          .status(400)
          .json({ message: "Password must be at least 8 characters" });
      }
      user.password = req.body.password; // The pre-save hook will hash this new password automatically
    }

    // save the updated user to the database
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      avatar: updatedUser.avatar,

      token: generateToken(updatedUser._id.toString()),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error updating profile" });
  }
};

// ---- UPDATE AVATAR-----
// POST /api/avatar
// Uploads a new profile picture to cloudinary
export const updateAvatar = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    //req.file is set by the multer middleware
    if (!req.file) {
      res.status(400).json({ message: "No image file provided" });
      return;
    }

    const user = await User.findById(req.user!._id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    //Delete the old avatar from cloudinary first (to save storage)
    if (user.avatarPublicId) {
      await deleteImage(user.avatarPublicId);
    }

    // convert the file buffer to a base64 data URI for cloudinary upload
    // cloudinary accepts based64 strings as input
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    // upload to cloudinary - returns an object with url, public_id etc
    const result = await uploadImage(base64, "personaltaskmanager/avatars");

    // save the new cloudinary URL and public ID to the user
    user.avatar = result.secure_url; //HTTPS image URL
    user.avatarPublicId = result.public_id; // ID for future deletion
    await user.save();

    res.json({ message: "Avatar updated successfully", avatar: user.avatar });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ message: "Server error uploading avatar" });
  }
};

//--- ADMIN: GET ALL USERS----
//GET /api/admin/users
//REturn all users (admin only)
export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Fetch all users, excluding their passwords
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching users" });
  }
};

// ---- ADMIN: UPDATE USER ROLE ----
// PUT /api/admin/users/:id
// toggle admin status or update user info (admin only)
export const updatedUserRole = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    //update the isAdmin flag
    user.isAdmin = req.body.isAdmin ?? user.isAdmin;
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error updating user" });
  }
};

//---- ADMIN: DELETE USER-----
// DELETE /api/admin/user/:id
// permanently remove a user (admin only)
export const deleteUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // prevent admins from deleting themselves
    if (user._id.toString() === req.user!._id.toString()) {
      res.status(400).json({ message: "You cannot delete your own account" });
      return;
    }

    // cleanup cloudinary avatar if it exists
    if (user.avatarPublicId) {
      await deleteImage(user.avatarPublicId);
    }

    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting user", error });
  }
};
