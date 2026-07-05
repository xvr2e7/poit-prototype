const express = require("express");
const seedPoemService = require("../services/seedPoemService");
const dailyWordStore = require("../services/dailyWordStore");
const { getSupabase } = require("../utils/supabaseClient");

const router = express.Router();

// In-memory cache for seed poems
const memoryCache = new Map();

const getValidTimezone = (timezone) => {
  if (!timezone || typeof timezone !== "string") return "UTC";
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

router.get("/", async (req, res) => {
  try {
    const timezone = getValidTimezone(
      req.get("X-Timezone") || req.query.timezone
    );
    const dateKey = getDateKeyForTimezone(timezone);
    const cacheKey = `${timezone}:${dateKey}`;

    // 1. Check memory cache
    if (memoryCache.has(cacheKey)) {
      return res.json(memoryCache.get(cacheKey));
    }

    // 2. Check Supabase
    const supabase = getSupabase();
    if (supabase) {
      const { data } = await supabase
        .from("daily_seed_poems")
        .select("poems,generated_at")
        .eq("timezone", timezone)
        .eq("date_key", dateKey)
        .maybeSingle();

      if (data?.poems?.length) {
        const result = {
          poems: data.poems,
          generatedAt: data.generated_at,
          dateKey,
        };
        memoryCache.set(cacheKey, result);
        return res.json(result);
      }
    }

    // 3. Generate new seed poems from today's word pool
    const wordData = await dailyWordStore.get(timezone, dateKey);
    const wordPool = wordData?.words || [];

    if (wordPool.length === 0) {
      return res.json({ poems: [], dateKey, generatedAt: null });
    }

    const poems = await seedPoemService.generateDailyPoems(wordPool);
    const generatedAt = new Date().toISOString();

    const result = { poems, generatedAt, dateKey };
    memoryCache.set(cacheKey, result);

    // Persist to Supabase
    if (supabase) {
      await supabase.from("daily_seed_poems").upsert(
        {
          timezone,
          date_key: dateKey,
          poems,
          generated_at: generatedAt,
        },
        { onConflict: "timezone,date_key" }
      );
    }

    return res.json(result);
  } catch (error) {
    console.error("Error in GET /api/seed-poems:", error);
    return res.status(500).json({
      message: "Failed to load seed poems",
      details: error.message,
    });
  }
});

module.exports = router;
