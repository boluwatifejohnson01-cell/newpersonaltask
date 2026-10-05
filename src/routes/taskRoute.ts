import express from "express";
import {
  createTask,
  getAllTasks,
  getTaskByCompleted,
  getTaskByTags,
} from "../controller/taskController";

const router = express.Router();

//Create Task Route
router.use("/task", createTask);

// Get All Task Route
router.use("/alltasks", getAllTasks);

//Get Tasks by Tag
router.use("/task/:tag", getTaskByTags);

//Get Tasks by Completed
router.use("/task/:completed", getTaskByCompleted);

export default router;
