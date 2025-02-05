const wordnik = require("./wordnikService");
const datamuse = require("./datamuseService");
const news = require("./newsService");

class WordService {
  async getWords() {
    try {
      let wordPool = new Map();
      let seeds = ["create", "explore"]; // Default seeds

      // Try to get WOTD
      try {
        const wotd = await wordnik.getWordOfDay();
        if (wotd) {
          console.log("Successfully fetched WOTD:", wotd.text);
          wordPool.set(wotd.text, wotd);
          seeds.unshift(wotd.text);
        }
      } catch (error) {
        console.log("Failed to fetch WOTD:", error.message);
      }

      // Try to get news topics
      try {
        const newsTopics = await news.getNewsTopics();
        if (newsTopics && newsTopics.length > 0) {
          console.log("Successfully fetched news topics:", newsTopics);
          seeds = [...new Set([...seeds, ...newsTopics])];
        }
      } catch (error) {
        console.log("Failed to fetch news topics:", error.message);
      }

      // Keep fetching words until we have enough
      let attempts = 0;
      const maxAttempts = 3;

      while (wordPool.size < 100 && attempts < maxAttempts) {
        // Shuffle and take some seeds
        const shuffledSeeds = seeds.sort(() => Math.random() - 0.5).slice(0, 4);

        console.log("Using seeds for related words:", shuffledSeeds);

        // Get words in parallel
        const relatedWords = await datamuse.getRelatedWords(shuffledSeeds);

        // Add words to pool
        relatedWords.forEach((word) => {
          if (!wordPool.has(word.text)) {
            wordPool.set(word.text, word);
          }
        });

        // If we don't have enough words, get fallback words using themed seeds
        if (wordPool.size < 100) {
          console.log("Getting additional words using fallback seeds...");
          const fallbackWords = await datamuse.getFallbackWords();
          fallbackWords.forEach((word) => {
            if (!wordPool.has(word.text)) {
              wordPool.set(word.text, word);
            }
          });
        }

        attempts++;
      }

      // Balance and select final words
      let words = this.balanceWordTypes(Array.from(wordPool.values()));

      // Ensure exactly 50 words
      words = words.slice(0, 50);

      if (words.length < 50) {
        console.log("Warning: Could not reach 50 words, got:", words.length);
      }

      console.log(`Returning ${words.length} words`);
      return words;
    } catch (error) {
      console.error("Error in WordService:", error);
      // Even in emergency, use fallback seeds to get related words
      return datamuse.getFallbackWords();
    }
  }

  balanceWordTypes(words) {
    // Calculate proportional targets based on total words
    const total = Math.min(words.length, 50);
    const targetCounts = {
      noun: Math.ceil(total * 0.4), // 40%
      verb: Math.ceil(total * 0.3), // 30%
      adj: Math.ceil(total * 0.3), // 30%
    };

    const byType = {
      noun: words.filter((w) => w.type === "noun"),
      verb: words.filter((w) => w.type === "verb"),
      adj: words.filter((w) => w.type === "adj"),
    };

    let result = [];

    // First pass: add words maintaining ratios
    Object.entries(targetCounts).forEach(([type, target]) => {
      const available = byType[type];
      const toAdd = available.sort(() => Math.random() - 0.5).slice(0, target);
      result.push(...toAdd);
    });

    // Second pass: if we're short, fill with any type
    if (result.length < total) {
      const remaining = total - result.length;
      const unusedWords = words.filter((w) => !result.includes(w));
      const additional = unusedWords
        .sort(() => Math.random() - 0.5)
        .slice(0, remaining);
      result.push(...additional);
    }

    // Final shuffle
    return result.sort(() => Math.random() - 0.5);
  }
}

module.exports = new WordService();
