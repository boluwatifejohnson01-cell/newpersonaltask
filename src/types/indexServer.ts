import { Document, Types } from "mongoose";
import { Request } from "express";

// This is the shape of a user document stored in mongoDB
// it extends mongoose's document so we get all mongodb methods (.save(), ._id etc)
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  avatar?: string;
  avatarPublicId?: string;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>; // Method to compare a plain-text password against the hashed stored password
}

// What we send back to the client after login/register (no password)
export interface IUserResponse {
  _id: string;
  name: string;
  email: string;
  isAdmin: string;
  avatar?: string;
  token: string; // JWT token for authentication
}

// This is the shape each Task will take in MongoDB
export interface Task extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  duedate: Date;
  tags: "Urgent" | "Personal" | "Work";
  completed: boolean;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface IJwtPayload {
  id: string; // users mongodb_id
}
