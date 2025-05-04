const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "https://poit.xzyan.com",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

// Import routes
const wordsRouter = require("./routes/words");
const poetryRouter = require("./routes/poetry");

// Routes
app.use("/api/words", wordsRouter);
app.use("/api/poetry", poetryRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === "APIError") {
    res.status(err.status || 500).json({
      error: err.message,
      type: "api_error",
    });
  } else {
    res.status(500).json({
      error: "Internal server error",
      type: "server_error",
    });
  }
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

// Call connectDB
connectDB();

// For local development
const PORT = process.env.PORT || 5001;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for serverless
module.exports = app;
