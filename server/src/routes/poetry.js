const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

const getFallbackPoem = () => ({
  title: "Do not go gentle into that good night",
  author: "Dylan Thomas",
  lines: [
    "Do not go gentle into that good night,",
    "Old age should burn and rave at close of day;",
    "Rage, rage against the dying of the light.",
    "",
    "Though wise men at their end know dark is right,",
    "Because their words had forked no lightning they",
    "Do not go gentle into that good night.",
    "",
    "Good men, the last wave by, crying how bright",
    "Their frail deeds might have danced in a green bay,",
    "Rage, rage against the dying of the light.",
    "",
    "Wild men who caught and sang the sun in flight,",
    "And learn, too late, they grieved it on its way,",
    "Do not go gentle into that good night.",
    "",
    "Grave men, near death, who see with blinding sight",
    "Blind eyes could blaze like meteors and be gay,",
    "Rage, rage against the dying of the light.",
    "",
    "And you, my father, there on the sad height,",
    "Curse, bless, me now with your fierce tears, I pray.",
    "Do not go gentle into that good night.",
    "Rage, rage against the dying of the light.",
  ],
  source: "fallback",
  year: "1947",
  refreshedAt: new Date().toISOString(),
});

const parsePoetsOrgPoem = (html) => {
  const $ = cheerio.load(html);

  const title =
    $("h1.c-hdgSans").first().text().trim() ||
    $("h1").first().text().trim() ||
    "Untitled";

  const author =
    $(".field--name-field-poem-author a").first().text().trim() ||
    $("a[href*='/poet/']").first().text().trim() ||
    "Unknown";

  const poemContainer =
    $(".field--name-body .field__item").first() ||
    $(".o-poem").first() ||
    $("article").first();

  const extractedLines = [];
  poemContainer.find("p, div, br").each((_, element) => {
    if (element.tagName === "br") {
      extractedLines.push("");
      return;
    }

    const text = $(element).text().trim();
    if (text) {
      extractedLines.push(text);
    }
  });

  const lines = extractedLines.length
    ? extractedLines
    : poemContainer
        .text()
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

  if (!title || lines.length === 0) {
    throw new Error("Could not parse poem from poets.org response");
  }

  return {
    title,
    author,
    lines,
    source: "poetsorg",
    refreshedAt: new Date().toISOString(),
  };
};

router.get("/poetsorg", async (req, res) => {
  try {
    const response = await axios.get("https://poets.org/poem-a-day", {
      timeout: 8000,
      headers: {
        "User-Agent": "POiT/1.0 (+https://poit.xzyan.com)",
      },
    });

    const poem = parsePoetsOrgPoem(response.data);
    return res.json(poem);
  } catch (error) {
    console.error("Error fetching poem of the day:", error.message);
    return res.json(getFallbackPoem());
  }
});

module.exports = router;
