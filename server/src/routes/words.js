const express = require("express");
const router = express.Router();
const WordService = require("../services/wordService");

// Cache structure now includes timezone information
const cacheStore = new Map();

const shouldRefreshCache = (timezone = "UTC") => {
  const cache = cacheStore.get(timezone);
  if (!cache?.data || !cache?.timestamp) {
    console.log(`Cache refresh needed: No cache for timezone ${timezone}`);
    return true;
  }

  // Convert timestamps to timezone-specific dates
  const now = new Date();
  const userTime = new Date(
    now.toLocaleString("en-US", { timeZone: timezone })
  );
  const lastRefreshTime = new Date(
    cache.timestamp.toLocaleString("en-US", { timeZone: timezone })
  );

  // Check if it's a new day in the user's timezone
  const isNewDay =
    userTime.getDate() !== lastRefreshTime.getDate() ||
    userTime.getMonth() !== lastRefreshTime.getMonth() ||
    userTime.getFullYear() !== lastRefreshTime.getFullYear();

  if (isNewDay) {
    console.log(`Cache refresh needed: New day in timezone ${timezone}`);
    return true;
  }

  console.log("Cache status:", {
    timezone,
    userTime: userTime.toISOString(),
    lastRefreshTime: lastRefreshTime.toISOString(),
    isNewDay,
  });

  return false;
};

router.get("/", async (req, res) => {
  try {
    // Get timezone from request header or query parameter
    const timezone = req.get("X-Timezone") || req.query.timezone || "UTC";
    console.log(
      `\n=== Processing GET /words request for timezone: ${timezone} ===`
    );

    if (shouldRefreshCache(timezone)) {
      console.log("Fetching fresh words...");
      const words = await WordService.getWords();

      cacheStore.set(timezone, {
        data: words,
        timestamp: new Date(),
      });

      console.log(`Words refreshed for timezone ${timezone}`);
    } else {
      console.log(`Using cached words for timezone ${timezone}`);
    }

    const cache = cacheStore.get(timezone);
    res.json({
      words: cache.data,
      refreshedAt: cache.timestamp,
      nextRefresh: getNextRefreshTime(timezone),
    });
  } catch (err) {
    console.error("Error in words route:", err);
    res.status(500).json({ message: err.message });
  }
});

// Helper to calculate next refresh time in user's timezone
const getNextRefreshTime = (timezone) => {
  const now = new Date();
  const userTime = new Date(
    now.toLocaleString("en-US", { timeZone: timezone })
  );
  const tomorrow = new Date(userTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

// Force refresh endpoint now accepts timezone
router.post("/refresh", async (req, res) => {
  try {
    const timezone = req.get("X-Timezone") || req.query.timezone || "UTC";
    console.log(
      `\n=== Processing POST /words/refresh request for timezone: ${timezone} ===`
    );

    const words = await WordService.getWords();
    cacheStore.set(timezone, {
      data: words,
      timestamp: new Date(),
    });

    res.json({
      message: "Cache refreshed successfully",
      wordCount: words.length,
      timezone,
      refreshedAt: cacheStore.get(timezone).timestamp,
      nextRefresh: getNextRefreshTime(timezone),
    });
  } catch (err) {
    console.error("Error during refresh:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
