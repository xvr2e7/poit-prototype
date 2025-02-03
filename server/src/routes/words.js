const express = require("express");
const router = express.Router();
const WordService = require("../services/wordService");

// In-memory cache
let cachedWords = null;
let lastFetchTime = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

router.get("/", async (req, res) => {
  try {
    const now = Date.now();

    // Check if we have valid cached words
    if (cachedWords && lastFetchTime && now - lastFetchTime < CACHE_DURATION) {
      console.log("Returning cached words");
      return res.json(cachedWords);
    }

    console.log("Fetching fresh words...");
    const startTime = Date.now();

    const words = await WordService.getWords();

    // Update cache
    cachedWords = words;
    lastFetchTime = now;

    const duration = Date.now() - startTime;
    console.log(`Words fetched in ${duration}ms`);
    console.log(`Total words: ${words.length}`);

    res.json(words);
  } catch (err) {
    console.error("Error in words route:", err);
    res.status(500).json({ message: err.message });
  }
});

// Optional: Add a force refresh endpoint for testing
router.post("/refresh", async (req, res) => {
  try {
    cachedWords = null;
    lastFetchTime = null;
    res.json({ message: "Cache cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
