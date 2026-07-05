const dictionaryService = require("./dictionaryService");
const poeticWordCurator = require("./poeticWordCurator");

class WordService {
  async getWords() {
    try {
      const wordMap = new Map();

      // 1. Get Word of the Day + recent WOTDs (5 words)
      const wotdCount = 5;
      const wotd = await dictionaryService.getWordOfDay();
      wordMap.set(wotd.text, wotd);

      const recentWotds = await dictionaryService.getRecentWotds(wotdCount - 1);
      for (const word of recentWotds) {
        if (!wordMap.has(word.text)) {
          wordMap.set(word.text, word);
        }
      }

      // 2. Fetch ~100 random words for AI scoring (up from ~75)
      const randomWordCount = Math.max(0, 100 - wordMap.size);
      const posCounts = {
        noun: Math.ceil(randomWordCount * 0.4),
        verb: Math.ceil(randomWordCount * 0.3),
        adj: Math.ceil(randomWordCount * 0.3),
      };

      const randomWords = await dictionaryService.getRandomWords(
        Math.ceil(randomWordCount * 1.5),
        posCounts,
        Array.from(wordMap.keys())
      );

      // 3. AI curation step — score words for poetic quality
      const curatedWords = await poeticWordCurator.curateWords(randomWords);

      // Use curated words if available, otherwise fall back to raw words
      const wordsToAdd = curatedWords || randomWords;
      const targetCount = 50 - wordMap.size;

      let addedCount = 0;
      for (const word of wordsToAdd) {
        if (!wordMap.has(word.text) && addedCount < targetCount) {
          wordMap.set(word.text, word);
          addedCount += 1;
        }
      }

      let finalWords = Array.from(wordMap.values());

      // 4. Fill shortfall if needed
      if (finalWords.length < 50) {
        const shortfall = 50 - finalWords.length;
        const additionalWords = dictionaryService.getEmergencyWords(shortfall);
        for (const word of additionalWords) {
          if (!wordMap.has(word.text) && finalWords.length < 50) {
            finalWords.push(word);
          }
        }
      }

      return finalWords.sort(() => Math.random() - 0.5).slice(0, 50);
    } catch (error) {
      console.error("Error in WordService:", error);
      return dictionaryService.getEmergencyWords(50);
    }
  }
}

module.exports = new WordService();
