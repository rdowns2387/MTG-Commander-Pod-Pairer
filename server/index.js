const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://pod-pairer-client.vercel.app"
        : "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
const connectDB = require("./config/db");
connectDB();

// Import routes
const authRoutes = require("./routes/authRoutes");
const queueRoutes = require("./routes/queueRoutes");
const podRoutes = require("./routes/podRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/pods", podRoutes);
app.use("/api/admin", adminRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("/", (req, res) => {
    console.log(res);
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
  });
} else {
  // Root route for development
  app.get("/", (req, res) => {
    res.send("MTG Pod Pairer API is running");
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server error",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Import cron service
const { initCronJobs } = require("./services/cronService");

// Start server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Initialize cron jobs
  initCronJobs();
});
