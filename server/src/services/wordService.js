const wordnik = require("./wordnikService");
const datamuse = require("./datamuseService");
const news = require("./newsService");

class WordService {
  async getWords() {
    try {
      let wordPool = new Map();

      // Parallel API calls
      const [wotd, newsTopics] = await Promise.all([
        wordnik.getWordOfDay(),
        news.getTopics(),
      ]);

      // Add WOTD first (highest priority)
      if (wotd) {
        wordPool.set(wotd.text, wotd);
      }

      // Get related words from both WOTD and news topics
      const seeds = [wotd.text, ...newsTopics].filter(Boolean);
      const relatedWords = await datamuse.getRelatedWords(seeds);

      // Add related words
      relatedWords.forEach((word) => {
        if (!wordPool.has(word.text)) {
          wordPool.set(word.text, word);
        }
      });

      // Balance word types and ensure 50 words
      let words = this.balanceWordTypes(Array.from(wordPool.values()));

      // If we don't have enough words, get more from Datamuse
      while (words.length < 50) {
        const additionalWords = await datamuse.getRelatedWords([
          "creative",
          "explore",
        ]);
        additionalWords.forEach((word) => {
          if (!wordPool.has(word.text)) {
            wordPool.set(word.text, word);
          }
        });
        words = this.balanceWordTypes(Array.from(wordPool.values()));
      }

      // Take exactly 50 words
      return words.slice(0, 50);
    } catch (error) {
      console.error("Error getting words:", error);
      const fallbackWords = await datamuse.getRelatedWords([
        "create",
        "explore",
      ]);
      return this.balanceWordTypes(fallbackWords).slice(0, 50);
    }
  }

  balanceWordTypes(words) {
    // Aim for 20 nouns (40%), 15 verbs (30%), 15 adjectives (30%)
    const targetCounts = { noun: 20, verb: 15, adj: 15 };
    const byType = {
      noun: words.filter((w) => w.type === "noun"),
      verb: words.filter((w) => w.type === "verb"),
      adj: words.filter((w) => w.type === "adj"),
    };

    let result = [];
    for (const [type, target] of Object.entries(targetCounts)) {
      const typeWords = byType[type]
        .sort((a, b) => b.score - a.score)
        .slice(0, target);

      // If we don't have enough words of this type, fill with highest scored words of other types
      if (typeWords.length < target) {
        const remaining = target - typeWords.length;
        const otherWords = words
          .filter((w) => !result.includes(w) && !typeWords.includes(w))
          .sort((a, b) => b.score - a.score)
          .slice(0, remaining);

        result.push(...typeWords, ...otherWords);
      } else {
        result.push(...typeWords);
      }
    }

    return result;
  }
}

module.exports = new WordService();
