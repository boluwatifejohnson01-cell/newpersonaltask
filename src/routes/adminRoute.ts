import express from "express";
import {
  deleteUser,
  getAllUsers,
  updatedUserRole,
} from "../controller/userController";

const router = express.Router();

//GET USERS
router.get("/users", getAllUsers);

//Update User Roles
router.put("/users/:id", updatedUserRole);

//Delete User
router.delete("/user/:id", deleteUser);

export default router;
