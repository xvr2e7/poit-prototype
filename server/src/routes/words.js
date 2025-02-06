const express = require("express");
const router = express.Router();
const WordService = require("../services/wordService");

// Cache structure with timezone information
const cacheStore = new Map();

const getValidTimezone = (timezone) => {
  try {
    // Test if the timezone is valid
    new Date().toLocaleString("en-US", { timeZone: timezone });
    return timezone;
  } catch (error) {
    console.log(`Invalid timezone: ${timezone}, falling back to UTC`);
    return "UTC";
  }
};

const shouldRefreshCache = (timezone) => {
  const validTimezone = getValidTimezone(timezone);
  const cache = cacheStore.get(validTimezone);

  if (!cache?.data || !cache?.timestamp) {
    console.log(`Cache refresh needed: No cache for timezone ${validTimezone}`);
    return true;
  }

  // Convert timestamps to timezone-specific dates
  const now = new Date();
  const userTime = new Date(
    now.toLocaleString("en-US", { timeZone: validTimezone })
  );
  const lastRefreshTime = new Date(
    cache.timestamp.toLocaleString("en-US", { timeZone: validTimezone })
  );

  // Check if it's a new day in the user's timezone
  const isNewDay =
    userTime.getDate() !== lastRefreshTime.getDate() ||
    userTime.getMonth() !== lastRefreshTime.getMonth() ||
    userTime.getFullYear() !== lastRefreshTime.getFullYear();

  if (isNewDay) {
    console.log(`Cache refresh needed: New day in timezone ${validTimezone}`);
    return true;
  }

  return false;
};

// Helper to calculate next refresh time in user's timezone
const getNextRefreshTime = (timezone) => {
  const validTimezone = getValidTimezone(timezone);
  const now = new Date();
  const userTime = new Date(
    now.toLocaleString("en-US", { timeZone: validTimezone })
  );
  const tomorrow = new Date(userTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

router.get("/", async (req, res) => {
  try {
    // Log all headers for debugging
    console.log("\nRequest headers:", req.headers);

    // Get timezone with logging
    const requestedTimezone = req.get("X-Timezone") || req.query.timezone;
    console.log("Requested timezone (raw):", requestedTimezone);

    const timezone = getValidTimezone(requestedTimezone);
    console.log("Validated timezone:", timezone);

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
    const response = {
      words: cache.data,
      refreshedAt: cache.timestamp,
      nextRefresh: getNextRefreshTime(timezone),
    };

    console.log("Sending response with metadata:", {
      wordsCount: response.words.length,
      refreshedAt: response.refreshedAt,
      nextRefresh: response.nextRefresh,
    });

    res.json(response);
  } catch (err) {
    console.error("Error in words route:", err);
    res.status(500).json({ message: err.message });
  }
});

// Force refresh endpoint
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
