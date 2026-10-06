import { Request, Response } from "express";
import dotenv from "dotenv";
import { AuthRequest } from "../types/indexServer";
import Task from "../models/Task";
import mongoose from "mongoose";

// Create Task (POST)
//POST api/task
export const createTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { title, description, duedate, tags, completed } = req.body;

    if (!title || !description || !duedate || !tags || !completed) {
      res.status(400).json({ message: "Please provide all required fields" });
    }

    const task = await Task.create({
      title,
      description,
      duedate,
      tags,
      completed,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error", error);
    res.status(500).json({ message: "Server error creating task" });
  }
};

// --- GET ALL TASKS ---
// GET /api/alltasks
export const getAllTasks = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Fetch all Tasks, newest first
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching products" });
  }
};

// --- GET TASK BY TAGS
// GET /api/task/:tag
export const getTaskByTags = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const validTags = ["Urgent", "Personal", "Work"] as const;
    const input = (req.params.tag as string).toLowerCase();

    // match case-insensitively, but keep the original capitalization
    const tag = validTags.find((t) => t.toLowerCase() === input);

    if (!tag) {
      res.status(400).json({ message: "Invalid Tag" });
      return;
    }

    const tasks = await Task.find({ tags: tag }).sort({ createdAt: -1 });

    if (tasks.length === 0) {
      res.status(404).json({ message: "No tasks found for this tag" });
      return;
    }

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching tasks by tags" });
  }
};

// GET TASK BY COMPLETED
// GET /api/task/:completed

export const getTaskByCompleted = async (req: AuthRequest, res: Response) => {
  try {
    const { completed } = req.params;

    if (completed !== "true" && completed !== "false") {
      res.status(400).json({ message: "Completed must be 'true' or 'false'" });
      return;
    }

    const tasks = await Task.find({
      completed: completed === "true",
    }).sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error fetching tasks by completed" });
  }
};

// ---- UPDATE TASK -----
// PUT /api/edittask::id
export const updateTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
      res.status(400).json({ message: "Invalid Task Id" });
      return;
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ message: "Task Not Found" });
      return;
    }

    // Update only provided fields using the nullish coalescing operator (??)
    task.title = req.body.title ?? task.title;
    task.description = req.body.description ?? task.description;

    task.duedate = req.body.duedate ?? task.duedate;
    task.tags = req.body.tags ?? task.tags;
    task.completed = req.body.completed ?? task.completed;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error updating Task" });
  }
};

//---- DELETE Task----
// DELETE /api/alltasks/:id
export const deleteTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
      res.status(400).json({ message: "invalid product ID" });
      return;
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    await task.deleteOne();
    res.status(204).json({ message: "Task deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting product" });
  }
};
