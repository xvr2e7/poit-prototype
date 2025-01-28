const express = require("express");
const router = express.Router();
const Word = require("../models/Word");
const DatamuseService = require("../services/datamuseService");

// Check if words need refresh (24 hours)
const needsRefresh = (refreshedAt) => {
  if (!refreshedAt) return true;
  const oneDayMs = 24 * 60 * 60 * 1000;
  return Date.now() - refreshedAt.getTime() > oneDayMs;
};

// Get random items from array
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Get active words
router.get("/", async (req, res) => {
  try {
    console.log("Fetching words...");
    let words = await Word.find({ isActive: true });
    console.log(`Found ${words.length} active words`);

    const shouldRefresh =
      words.length === 0 || needsRefresh(words[0]?.refreshedAt);
    console.log(`Should refresh: ${shouldRefresh}`);

    if (shouldRefresh) {
      console.log("Starting refresh process...");

      // Deactivate old words
      await Word.updateMany({}, { isActive: false });
      console.log("Deactivated old words");

      // Get new words from Datamuse
      console.log("Fetching new words from Datamuse...");
      const newWords = await DatamuseService.getWords();
      console.log(`Received ${newWords.length} words from Datamuse`);

      // Select 50 random words
      const selectedWords = getRandomItems(newWords, 50);
      console.log(`Selected ${selectedWords.length} random words`);

      // Save new words
      words = await Word.insertMany(
        selectedWords.map((word) => ({
          ...word,
          refreshedAt: new Date(),
          isActive: true,
        }))
      );
      console.log(`Saved ${words.length} new words to database`);
    }

    res.json(words);
  } catch (err) {
    console.error("Error in words route:", err);
    res.status(500).json({ message: err.message });
  }
});

// Force refresh (for testing)
router.post("/refresh", async (req, res) => {
  try {
    console.log("Force refreshing words...");
    await Word.updateMany({}, { isActive: false });
    const newWords = await DatamuseService.getWords();
    console.log(`Got ${newWords.length} words from Datamuse`);
    const selectedWords = getRandomItems(newWords, 50);
    const words = await Word.insertMany(
      selectedWords.map((word) => ({
        ...word,
        refreshedAt: new Date(),
        isActive: true,
      }))
    );
    console.log(`Saved ${words.length} new words`);
    res.json(words);
  } catch (err) {
    console.error("Error in force refresh:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
