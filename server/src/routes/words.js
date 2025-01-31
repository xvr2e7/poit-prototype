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

// Get active words
router.get("/", async (req, res) => {
  try {
    console.log("Checking word pool...");
    let words = await Word.find({ isActive: true });

    const shouldRefresh =
      words.length === 0 || needsRefresh(words[0]?.refreshedAt);

    if (shouldRefresh) {
      console.log("Refreshing word pool...");
      let newWords = [];
      let attempts = 0;
      const MAX_ATTEMPTS = 3;

      while (attempts < MAX_ATTEMPTS && newWords.length < 50) {
        try {
          const wordPool = await DatamuseService.getWords();

          if (wordPool.length >= 50) {
            // Select random words, ensuring diverse types
            newWords = selectDiverseWords(wordPool, 50);
            break;
          }

          attempts++;
          console.log(`Attempt ${attempts}: Got ${wordPool.length} words`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Attempt ${attempts + 1} failed:`, error);
          attempts++;
        }
      }

      if (newWords.length >= 50) {
        // Deactivate old words only if we have new ones
        await Word.updateMany({}, { isActive: false });

        // Insert new words
        words = await Word.insertMany(
          newWords.map((word) => ({
            text: word.word,
            type: getWordType(word),
            score: word.score || 0,
            source: word.source || "general",
            refreshedAt: new Date(),
            isActive: true,
          }))
        );

        console.log(`Successfully refreshed with ${words.length} new words`);
      } else {
        console.log("Keeping existing words active");
        if (words.length === 0) {
          return res.status(500).json({
            message:
              "Could not fetch new words and no existing words available",
          });
        }
      }
    }

    res.json(words);
  } catch (err) {
    console.error("Error in words route:", err);
    res.status(500).json({ message: err.message });
  }
});

function getWordType(word) {
  if (word.tags?.includes("adj")) return "adj";
  if (word.tags?.includes("v")) return "verb";
  return "noun";
}

function selectDiverseWords(wordPool, count) {
  // Ensure a mix of word types
  const types = ["n", "v", "adj"];
  const wordsPerType = Math.floor(count / types.length);

  let selected = [];

  // Select words for each type
  types.forEach((type) => {
    const typeWords = wordPool
      .filter((w) => w.tags?.includes(type))
      .sort(() => 0.5 - Math.random())
      .slice(0, wordsPerType);
    selected.push(...typeWords);
  });

  // Fill remaining slots randomly
  const remaining = count - selected.length;
  if (remaining > 0) {
    const additional = wordPool
      .filter((w) => !selected.includes(w))
      .sort(() => 0.5 - Math.random())
      .slice(0, remaining);
    selected.push(...additional);
  }

  return selected;
}

// Force refresh (for testing)
router.post("/refresh", async (req, res) => {
  try {
    console.log("Force refreshing word pool...");
    let newWords = [];
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    while (attempts < MAX_ATTEMPTS && newWords.length < 50) {
      try {
        const wordPool = await DatamuseService.getWords();

        if (wordPool.length >= 50) {
          // Ensure uniqueness by text before selection
          const uniqueWordPool = Array.from(
            new Map(
              wordPool.map((word) => [word.word.toLowerCase(), word])
            ).values()
          );

          newWords = selectDiverseWords(uniqueWordPool, 50);
          break;
        }

        attempts++;
        console.log(`Attempt ${attempts}: Got ${wordPool.length} words`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Attempt ${attempts + 1} failed:`, error);
        attempts++;
      }
    }

    if (newWords.length >= 50) {
      // Clear all existing words first
      await Word.deleteMany({});

      // Now insert new unique words
      const words = await Word.insertMany(
        newWords.map((word) => ({
          text: word.word.toLowerCase(), // Ensure lowercase for consistency
          type: getWordType(word),
          score: word.score || 0,
          source: word.source || "general",
          refreshedAt: new Date(),
          isActive: true,
        })),
        { ordered: false } // Continue inserting if one fails
      );

      console.log(`Successfully refreshed with ${words.length} new words`);
      res.json(words);
    } else {
      res.status(500).json({
        message: "Could not fetch enough new words",
      });
    }
  } catch (err) {
    console.error("Error in force refresh:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
