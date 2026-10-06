import express from "express";
import {
  deleteUser,
  getAllUsers,
  updatedUserRole,
} from "../controller/userController";
import { admin, protect } from "../middlewares/authMiddleware";

const router = express.Router();

// Apply BOTH protected and admin middleware to ALL routes in this field
// Every route below requires the user to be logged in AND be an admin
router.use(protect, admin);

//GET USERS
router.get("/users", getAllUsers);

//Update User Roles
router.put("/users/:id", updatedUserRole);

//Delete User
router.delete("/user/:id", deleteUser);

export default router;
