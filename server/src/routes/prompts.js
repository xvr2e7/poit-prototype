const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const promptService = require("../services/promptService");
const dailyWordStore = require("../services/dailyWordStore");

const router = express.Router();

const memoryCache = new Map();

const getSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

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

    // Check memory cache
    if (memoryCache.has(cacheKey)) {
      return res.json(memoryCache.get(cacheKey));
    }

    // Check Supabase
    const supabase = getSupabase();
    if (supabase) {
      const { data } = await supabase
        .from("daily_prompts")
        .select("prompt,theme,suggested_words,sparks,generated_at")
        .eq("timezone", timezone)
        .eq("date_key", dateKey)
        .maybeSingle();

      if (data?.prompt) {
        const result = {
          prompt: data.prompt,
          theme: data.theme,
          suggestedWords: data.suggested_words,
          sparks: data.sparks,
          generatedAt: data.generated_at,
          dateKey,
        };
        memoryCache.set(cacheKey, result);
        return res.json(result);
      }
    }

    // Generate new prompt from today's word pool
    const wordData = await dailyWordStore.get(timezone, dateKey);
    const wordPool = wordData?.words || [];

    if (wordPool.length === 0) {
      return res.json({
        prompt: "What does silence sound like?",
        theme: "silence",
        suggestedWords: [],
        sparks: [],
        dateKey,
      });
    }

    const promptData = await promptService.generateDailyPrompt(wordPool);
    const generatedAt = new Date().toISOString();

    const result = { ...promptData, generatedAt, dateKey };
    memoryCache.set(cacheKey, result);

    // Persist to Supabase
    if (supabase) {
      await supabase.from("daily_prompts").upsert(
        {
          timezone,
          date_key: dateKey,
          prompt: promptData.prompt,
          theme: promptData.theme,
          suggested_words: promptData.suggestedWords,
          sparks: promptData.sparks,
          generated_at: generatedAt,
        },
        { onConflict: "timezone,date_key" }
      );
    }

    return res.json(result);
  } catch (error) {
    console.error("Error in GET /api/daily-prompt:", error);
    return res.status(500).json({
      message: "Failed to load daily prompt",
      details: error.message,
    });
  }
});

module.exports = router;
