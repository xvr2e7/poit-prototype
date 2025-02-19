const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
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
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
