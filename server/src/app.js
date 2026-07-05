const express = require("express");
const cors = require("cors");

const wordsRouter = require("./routes/words");
const poetryRouter = require("./routes/poetry");
const seedPoemsRouter = require("./routes/seedPoems");
const promptsRouter = require("./routes/prompts");
const poemsRouter = require("./routes/poems");

const app = express();

app.use(
  cors({
    origin: [
      "https://poit.xzyan.com",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "POiT API server is running",
    endpoints: ["/api/words", "/api/poetry/poetsorg", "/api/seed-poems", "/api/daily-prompt", "/api/poems"],
  });
});

app.use("/api/words", wordsRouter);
app.use("/api/poetry", poetryRouter);
app.use("/api/seed-poems", seedPoemsRouter);
app.use("/api/daily-prompt", promptsRouter);
app.use("/api/poems", poemsRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "APIError") {
    return res.status(err.status || 500).json({
      error: err.message,
      type: "api_error",
    });
  }

  return res.status(500).json({
    error: "Internal server error",
    type: "server_error",
  });
});

module.exports = app;
