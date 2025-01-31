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
    console.log("\n=== Word Pool Check ===");
    console.log("Time:", new Date().toISOString());

    let words = await Word.find({ isActive: true });
    console.log(`Found ${words.length} active words`);

    if (words.length > 0) {
      console.log("Last refresh:", words[0]?.refreshedAt);
    }

    const shouldRefresh =
      words.length === 0 || needsRefresh(words[0]?.refreshedAt);
    console.log("Needs refresh:", shouldRefresh);

    if (shouldRefresh) {
      console.log("\n=== Starting Word Refresh ===");
      let newWords = [];
      let attempts = 0;
      const MAX_ATTEMPTS = 3;

      while (attempts < MAX_ATTEMPTS && newWords.length < 50) {
        try {
          console.log(`\nAttempt ${attempts + 1}:`);
          console.log("Fetching news topics...");
          const wordPool = await DatamuseService.getWords();
          console.log(`Retrieved ${wordPool.length} words from Datamuse`);

          if (wordPool.length >= 50) {
            newWords = selectDiverseWords(wordPool, 50);
            console.log("\nSelected words by type:");
            const typeCount = newWords.reduce((acc, word) => {
              const type = getWordType(word);
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            }, {});
            console.log(typeCount);

            console.log("\nFinal word list:");
            newWords.forEach((word, i) => {
              console.log(`${i + 1}. ${word.word} (${getWordType(word)})`);
            });
            break;
          }

          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Attempt ${attempts + 1} failed:`, error);
          attempts++;
        }
      }

      if (newWords.length >= 50) {
        await Word.updateMany({}, { isActive: false });
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
        console.log(`\nSuccessfully refreshed with ${words.length} new words`);
      } else {
        console.log("\nKeeping existing words active");
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
