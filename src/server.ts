import express from "express";
import dns from "dns";
import connectDB from "./config/db";
import dotenv from "dotenv";
import taskRoute from "./routes/taskRoute";
import userRoute from "./routes/userRoute";
import { errorHandler } from "./middlewares/errorMiddleware";

dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();

//Parse incoming JSON request bodies
// limit: 10mb allows base64 images uploads in the req.body
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded form data (e.g, from HTML forms)
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Simple request logger - logs every incoming request
// Useful for debugging in development
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next(); // Always call next() to continue processing
});

// Health check - a simple endpoint to verify the server is running
// Used by development platforms (like render) to check server health
app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
    message: "Personal Task Manager server is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

const PORT = Number(process.env.PORT) || 1700;

//Routes Registration
//Task Routes
app.use("/api", taskRoute);

//User Routes
app.use("/api", userRoute);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n✈️ server running on port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// 404 HANDLER = catches any requests to undefined routes
app.use((_req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// Error handler - MUST be the LAST middleware
app.use(errorHandler);

// Handle unhandled promises rejections (catches async errors not caught by try/catch)
process.on("unhandledRejection", (reason: Error) => {
  console.error("Unhandled Promise Rejection", reason.message);
  process.exit(1);
});

startServer();

export default app;
