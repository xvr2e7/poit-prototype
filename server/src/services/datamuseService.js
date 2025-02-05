const axios = require("axios");

class DatamuseService {
  constructor() {
    this.api = axios.create({
      baseURL: "https://api.datamuse.com",
      timeout: 5000,
    });

    // Some random fallback seeds grouped by theme
    this.fallbackSeeds = {
      creative: ["create", "imagine", "explore", "design", "craft"],
      nature: ["garden", "forest", "ocean", "mountain", "river"],
      emotion: ["wonder", "dream", "gentle", "vibrant", "peaceful"],
      movement: ["dance", "flow", "spiral", "drift", "glide"],
      light: ["glow", "shimmer", "sparkle", "shine", "gleam"],
    };
  }

  async getRelatedWords(seeds) {
    try {
      const words = new Map();

      // Make API calls in parallel for each seed
      const promises = seeds.map((seed) =>
        Promise.all([
          this.api.get("/words", {
            params: {
              ml: seed, // "means like"
              md: "p", // include parts of speech
              max: 30,
            },
          }),
          this.api.get("/words", {
            params: {
              rel_trg: seed, // "triggers"
              md: "p",
              max: 20,
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
      // Select 2 random themes
      const themes = Object.keys(this.fallbackSeeds);
      const selectedThemes = themes.sort(() => Math.random() - 0.5).slice(0, 2);

      // Get 3 random seeds from each selected theme
      const fallbackSeeds = selectedThemes.flatMap((theme) =>
        this.fallbackSeeds[theme].sort(() => Math.random() - 0.5).slice(0, 3)
      );

      console.log("Using fallback seed themes:", selectedThemes);
      console.log("Selected fallback seeds:", fallbackSeeds);

      // Use these seeds to get related words
      return this.getRelatedWords(fallbackSeeds);
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

    // Basic validation
    if (!/^[a-z-]+$/.test(text)) return false;
    if (text.length < 3 || text.length > 12) return false;

    // Check for common suffixes we might want to avoid
    const unwantedSuffixes = ["ing", "ed", "ly", "er", "est"];
    if (unwantedSuffixes.some((suffix) => text.endsWith(suffix))) {
      return false;
    }

    return true;
  }

  // Helper method to get seeds for testing
  getFallbackSeeds() {
    return this.fallbackSeeds;
  }
}

module.exports = new DatamuseService();
