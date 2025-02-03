const axios = require("axios");
class DatamuseService {
  constructor() {
    this.api = axios.create({
      baseURL: "https://api.datamuse.com",
      timeout: 5000,
    });
  }

  async getRelatedWords(seeds) {
    try {
      const words = new Map();

      // Make API calls in parallel for each seed
      const promises = seeds.map((seed) =>
        Promise.all([
          this.api.get("/words", {
            params: {
              ml: seed,
              md: "p",
              max: 15,
            },
          }),
          this.api.get("/words", {
            params: {
              rel_trg: seed,
              md: "p",
              max: 10,
            },
          }),
        ])
      );

      const results = await Promise.all(promises);

      // Process results
      results.forEach(([related, triggered]) => {
        [...related.data, ...triggered.data].forEach((word) => {
          if (this.isQualityWord(word)) {
            words.set(word.word.toLowerCase(), {
              text: word.word.toLowerCase(),
              type: this.getWordType(word.tags?.[0]),
              score: word.score || 500,
              source: "datamuse",
            });
          }
        });
      });

      return Array.from(words.values());
    } catch (error) {
      console.error("Error fetching related words:", error);
      return [];
    }
  }

  async getFallbackWords() {
    try {
      const response = await this.api.get("/words", {
        params: {
          topics: "art,nature,technology",
          md: "p",
          max: 50,
        },
      });

      return response.data.filter(this.isQualityWord).map((word) => ({
        text: word.word.toLowerCase(),
        type: this.getWordType(word.tags?.[0]),
        score: 500,
        source: "datamuse_fallback",
      }));
    } catch (error) {
      console.error("Error getting fallback words:", error);
      return [];
    }
  }

  getWordType(tag) {
    if (tag === "adj" || tag === "adjective") return "adj";
    if (tag === "v" || tag === "verb") return "verb";
    return "noun";
  }

  isQualityWord(word) {
    if (!word?.word) return false;
    const text = word.word.toLowerCase();
    if (!/^[a-z-]+$/.test(text)) return false;
    if (text.length < 3 || text.length > 12) return false;
    return true;
  }
}

module.exports = new DatamuseService();
