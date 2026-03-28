const dictionaryService = require("./dictionaryService");

class WordService {
  async getWords() {
    try {
      const wordMap = new Map();

      const wotdCount = 5;
      const wotd = await dictionaryService.getWordOfDay();
      wordMap.set(wotd.text, wotd);

      const recentWotds = await dictionaryService.getRecentWotds(wotdCount - 1);
      for (const word of recentWotds) {
        if (!wordMap.has(word.text)) {
          wordMap.set(word.text, word);
        }
      }

      const randomWordCount = Math.max(0, 50 - wordMap.size);
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

      let addedCount = 0;
      for (const word of randomWords) {
        if (!wordMap.has(word.text) && addedCount < randomWordCount) {
          wordMap.set(word.text, word);
          addedCount += 1;
        }
      }

      let finalWords = Array.from(wordMap.values());

      if (finalWords.length < 50) {
        const shortfall = 50 - finalWords.length;

        const additionalWords = await dictionaryService.getRandomWords(
          shortfall * 2,
          null,
          finalWords.map((word) => word.text)
        );

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
