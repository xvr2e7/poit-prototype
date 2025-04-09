const dictionaryService = require("./dictionaryService");

class WordService {
  async getWords() {
    try {
      console.log("\n=== Starting word selection ===");

      // Word pool with tracking by ID for deduplication
      const wordMap = new Map();

      // PHASE 1: Get Word of the Day
      const wotdCount = 5;
      const wotd = await dictionaryService.getWordOfDay();
      wordMap.set(wotd.text, wotd);

      // Get a few recent WOTDs as well
      const recentWotds = await dictionaryService.getRecentWotds(wotdCount - 1);
      for (const word of recentWotds) {
        if (!wordMap.has(word.text)) {
          wordMap.set(word.text, word);
        }
      }

      console.log(
        `Added ${wordMap.size} word(s) of the day: ${(wotd, recentWotds)}`
      );

      // PHASE 2: Get completely random words
      // Ensure proper POS distribution
      const randomWordCount = 50 - wordMap.size;
      const posCounts = {
        noun: Math.ceil(randomWordCount * 0.4), // 40% nouns
        verb: Math.ceil(randomWordCount * 0.3), // 30% verbs
        adj: Math.ceil(randomWordCount * 0.3), // 30% adjectives (+ adverbs)
      };

      const randomWords = await dictionaryService.getRandomWords(
        randomWordCount * 1.5, // Request extras to ensure we have enough
        posCounts,
        Array.from(wordMap.keys())
      );

      // Add random words until we reach our target
      let addedCount = 0;
      for (const word of randomWords) {
        if (!wordMap.has(word.text) && addedCount < randomWordCount) {
          wordMap.set(word.text, word);
          addedCount++;
        }
      }

      console.log(`Added ${addedCount} random words`);

      // Convert to array, shuffle, and limit to exactly 50 words
      let finalWords = Array.from(wordMap.values());

      // If we somehow don't have enough words, get more random ones
      if (finalWords.length < 50) {
        const shortfall = 50 - finalWords.length;
        console.log(`Filling shortfall of ${shortfall} words`);

        const additionalWords = await dictionaryService.getRandomWords(
          shortfall * 2,
          null,
          finalWords.map((w) => w.text)
        );

        for (const word of additionalWords) {
          if (!wordMap.has(word.text) && finalWords.length < 50) {
            finalWords.push(word);
          }
        }
      }

      // Final shuffle and limit
      return finalWords.sort(() => Math.random() - 0.5).slice(0, 50);
    } catch (error) {
      console.error("Error in WordService:", error);
      return dictionaryService.getEmergencyWords(50);
    }
  }
}

module.exports = new WordService();
