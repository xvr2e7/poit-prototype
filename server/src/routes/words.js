const express = require("express");
const router = express.Router();
const WordService = require("../services/wordService");

// In-memory cache with timestamp
let wordCache = {
  data: null,
  timestamp: null,
};

// Cache duration (24 hours in milliseconds)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Helper to check if cache needs refresh
const shouldRefreshCache = () => {
  if (!wordCache.data || !wordCache.timestamp) {
    console.log("Cache refresh needed: Cache is empty or has no timestamp");
    return true;
  }

  const now = Date.now();
  const cacheAge = now - wordCache.timestamp;

  // Check if it's a new day (past midnight) since last refresh
  const lastRefreshDate = new Date(wordCache.timestamp);
  const currentDate = new Date(now);
  const isNewDay =
    currentDate.getDate() !== lastRefreshDate.getDate() ||
    currentDate.getMonth() !== lastRefreshDate.getMonth() ||
    currentDate.getFullYear() !== lastRefreshDate.getFullYear();

  console.log("Cache status:", {
    cacheAge: `${Math.round(cacheAge / 1000)}s`,
    isNewDay,
    needsRefresh: cacheAge >= CACHE_DURATION || isNewDay,
  });

  return cacheAge >= CACHE_DURATION || isNewDay;
};

// Helper to fetch fresh words
const fetchFreshWords = async () => {
  console.log("Fetching fresh words from WordService...");
  const startTime = Date.now();
  const words = await WordService.getWords();
  const duration = Date.now() - startTime;

  console.log(`Fetched ${words.length} words in ${duration}ms`);

  wordCache = {
    data: words,
    timestamp: Date.now(),
  };

  return words;
};

router.get("/", async (req, res) => {
  try {
    console.log("\n=== Processing GET /words request ===");

    if (shouldRefreshCache()) {
      const words = await fetchFreshWords();
      res.json(words);
    } else {
      console.log(
        "Using cached words from:",
        new Date(wordCache.timestamp).toLocaleString()
      );
      res.json(wordCache.data);
    }
  } catch (err) {
    console.error("Error in words route:", err);
    res.status(500).json({ message: err.message });
  }
});

// Force refresh endpoint
router.post("/refresh", async (req, res) => {
  try {
    console.log("\n=== Processing POST /words/refresh request ===");

    // Clear cache first
    console.log("Clearing existing cache...");
    wordCache = {
      data: null,
      timestamp: null,
    };

    // Immediately fetch new words
    console.log("Initiating fresh word fetch...");
    const words = await fetchFreshWords();

    console.log("Refresh completed successfully");
    res.json({
      message: "Cache refreshed successfully",
      wordCount: words.length,
      timestamp: wordCache.timestamp,
    });
  } catch (err) {
    console.error("Error during refresh:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
