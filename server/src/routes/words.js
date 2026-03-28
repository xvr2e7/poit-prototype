const express = require("express");

const WordService = require("../services/wordService");
const dailyWordStore = require("../services/dailyWordStore");

const router = express.Router();

const getValidTimezone = (timezone) => {
  if (!timezone || typeof timezone !== "string") {
    return "UTC";
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
    return timezone;
  } catch {
    return "UTC";
  }
};

const getDateKeyForTimezone = (timezone) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
};

const getNextRefreshTime = (timezone) => {
  const now = new Date();
  const localeDate = now.toLocaleString("en-US", { timeZone: timezone });
  const userTime = new Date(localeDate);
  const tomorrow = new Date(userTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

const getDailyWords = async (timezone, forceRefresh = false) => {
  const dateKey = getDateKeyForTimezone(timezone);

  if (!forceRefresh) {
    const cached = await dailyWordStore.get(timezone, dateKey);
    if (cached?.words?.length) {
      return cached;
    }
  }

  const words = await WordService.getWords();
  return dailyWordStore.upsert(timezone, dateKey, words);
};

router.get("/", async (req, res) => {
  try {
    const requestedTimezone = req.get("X-Timezone") || req.query.timezone;
    const timezone = getValidTimezone(requestedTimezone);

    const { words, refreshedAt } = await getDailyWords(timezone, false);

    return res.json({
      words,
      refreshedAt,
      nextRefresh: getNextRefreshTime(timezone),
      timezone,
    });
  } catch (error) {
    console.error("Error in GET /api/words:", error);
    return res.status(500).json({
      message: "Failed to load daily words",
      details: error.message,
    });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const requestedTimezone = req.get("X-Timezone") || req.query.timezone;
    const timezone = getValidTimezone(requestedTimezone);

    const { words, refreshedAt, dateKey } = await getDailyWords(timezone, true);

    return res.json({
      message: "Daily words refreshed",
      timezone,
      dateKey,
      wordCount: words.length,
      refreshedAt,
      nextRefresh: getNextRefreshTime(timezone),
    });
  } catch (error) {
    console.error("Error in POST /api/words/refresh:", error);
    return res.status(500).json({
      message: "Failed to refresh daily words",
      details: error.message,
    });
  }
});

module.exports = router;
