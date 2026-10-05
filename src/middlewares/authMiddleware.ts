import { NextFunction, Response } from "express";
import { AuthRequest, IJwtPayload } from "../types/indexServer";
import jwt from "jsonwebtoken";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config;

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as IJwtPayload;

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      req.user = user;

      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ message: "Not authorized - invalid token" });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized - no token provided" });
    return;
  }
};

// ---- admin middleware -----
// used AFTER "protect" - it relies on req.user being set
// checks if the logged-in user has admin privileges
export const admin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  // req.user was set by the "protect" middleware above
  if (req.user && req.user.isAdmin) {
    next(); // user is admin - allow access
  } else {
    res.status(403).json({ message: "Not authorised as admin" });
  }
};

