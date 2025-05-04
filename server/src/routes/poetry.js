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

    // Extract poem title
    const title =
      $(
        ".daily-poem__poem-title, .d-flex.pt-3.pb-3.daily-poem__poem-title, .daily-poem__title, .poem-a-day__title, h1.poem__title"
      )
        .first()
        .text()
        .trim() || "Untitled";

    // Extract poet name
    let author = "";

    const authorLink = $(
      ".poem-a-day__poem-author a[itemprop='name'], .field--field_author a[itemprop='name']"
    ).first();
    if (authorLink.length) {
      author = authorLink.text().trim();
    } else {
      // Try the div containing the author directly
      const authorDiv = $(".poem-a-day__poem-author").first();
      if (authorDiv.length) {
        author = authorDiv.text().trim();
      } else {
        // Fallback selectors
        author = $(".poem__author a, .daily-poem__poet, .poem-a-day__poet")
          .first()
          .text()
          .trim();
      }
    }

    // Extract poem body
    let lines = [];

    $(
      ".daily-poem__poem-text.poem__body span.long-line, .daily-poem__poem-text .field--body p span.long-line, .poem__body .field--body p span.long-line"
    ).each((i, el) => {
      const line = $(el).text().trim();
      lines.push(line); // Include empty lines for poem structure
    });

    // Handle br tags by inserting empty lines
    $(
      ".daily-poem__poem-text.poem__body br, .daily-poem__poem-text .field--body br, .poem__body .field--body br"
    ).each((i, el) => {
      lines.push("");
    });

    // If no lines were found with long-line spans, try regular paragraph text
    if (lines.length === 0) {
      $(
        ".daily-poem__poem-text .field--body p, .poem__body .field--body p"
      ).each((i, el) => {
        // Get only the direct text content, not the nested elements
        $(el)
          .contents()
          .each((j, node) => {
            if (node.type === "text") {
              const line = $(node).text().trim();
              if (line) {
                lines.push(line);
              }
            }
          });
      });
    }

    // Try directly getting the content of the poem body div
    if (lines.length === 0) {
      $(".daily-poem__poem-text.poem__body").each((i, el) => {
        $(el)
          .contents()
          .each((j, node) => {
            if (node.type === "text") {
              const text = $(node).text().trim();
              if (text) {
                lines.push(text);
              }
            }
          });
      });
    }

    // As a last resort, try getting all text from the poem body
    if (lines.length === 0) {
      const bodyText = $(
        ".daily-poem__poem-text .field--body, .poem__body .field--body, .daily-poem__poem-text.poem__body"
      )
        .text()
        .trim();
      if (bodyText) {
        lines = bodyText
          .split(/\n+/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
      }
    }

    console.log("Extracted poem data:", {
      title,
      author: author || "Unknown",
      lineCount: lines.length,
      sampleLines: lines.slice(0, 2),
    });

    res.json({
      title,
      author: author || "Unknown",
      lines,
      source: "poetsorg",
      refreshedAt: new Date().toISOString(),
    });

    // Cache the result
    poetryCache.data = result;
    poetryCache.timestamp = now;

    res.json(result);
  } catch (error) {
    console.error("poets.org API error:", {
      message: error.message,
      response: error.response?.status,
    });

    res.status(error.response?.status || 500).json({
      error: "Failed to fetch from poets.org",
      details: error.message,
    });
  }
});

module.exports = router;
