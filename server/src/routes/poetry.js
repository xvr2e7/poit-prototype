const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const router = express.Router();

const CACHE_TTL = 3600000; // 1 hour in milliseconds
let poetryCache = {
  data: null,
  timestamp: 0,
};

router.get("/poetsorg", async (req, res) => {
  try {
    // Check cache first
    const now = Date.now();
    if (poetryCache.data && now - poetryCache.timestamp < CACHE_TTL) {
      console.log("Serving poem from cache");
      return res.json(poetryCache.data);
    }

    console.log("Fetching poem from poets.org");
    const response = await axios.get("https://poets.org/poem-a-day", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      timeout: 5000,
    });

    const $ = cheerio.load(response.data);

    // Simplified selector strategy
    const title = $("h1.poem__title").first().text().trim() || "Untitled";
    const author = $(".poem__author").text().trim() || "Unknown";

    // Simplify line extraction
    let lines = [];
    $(".poem__body p").each(function () {
      const text = $(this).text().trim();
      if (text) lines.push(text);
    });

    const result = {
      title,
      author,
      lines,
      source: "poetsorg",
      refreshedAt: new Date().toISOString(),
    };

    // Cache the result
    poetryCache.data = result;
    poetryCache.timestamp = now;

    res.json(result);
  } catch (error) {
    console.error("poets.org API error:", {
      message: error.message,
      response: error.response?.status,
    });

    return res.json(getFallbackPoem());
  }
});

function getFallbackPoem() {
  return {
    title: "Do not go gentle into that good night",
    author: "Dylan Thomas",
    lines: [
      "Do not go gentle into that good night,",
      "Old age should burn and rave at close of day;",
      "Rage, rage against the dying of the light.",
      "Though wise men at their end know dark is right,",
      "Because their words had forked no lightning they",
      "Do not go gentle into that good night.",
      "Good men, the last wave by, crying how bright",
      "Their frail deeds might have danced in a green bay,",
      "Rage, rage against the dying of the light.",
      "Wild men who caught and sang the sun in flight,",
      "And learn, too late, they grieved it on its way,",
      "Do not go gentle into that good night.",
      "Grave men, near death, who see with blinding sight",
      "Blind eyes could blaze like meteors and be gay,",
      "Rage, rage against the dying of the light.",
      "And you, my father, there on the sad height,",
      "Curse, bless, me now with your fierce tears, I pray.",
      "Do not go gentle into that good night.",
      "Rage, rage against the dying of the light.",
    ],
    source: "fallback",
    refreshedAt: new Date().toISOString(),
  };
}

module.exports = router;
