const axios = require("axios");
const poeticWords = require("../data/poeticWords.json");

class DictionaryService {
  constructor() {
    this.wordnikApi = axios.create({
      baseURL: "https://api.wordnik.com/v4",
      timeout: 5000,
      headers: {
        api_key: process.env.WORDNIK_API_KEY,
      },
    });

    this.wotdHistory = [];
    this.exclusionFilters = this.initExclusionFilters();
  }

  initExclusionFilters() {
    // Technical/unpoetic terms to hard-reject
    const technicalTerms = new Set([
      "pascal", "algorithm", "optimize", "optimizing", "compile", "compiler",
      "boolean", "integer", "syntax", "binary", "debug", "malloc",
      "bandwidth", "firmware", "ethernet", "pixel", "database", "server",
      "markup", "stylesheet", "frontend", "backend", "middleware", "runtime",
      "startup", "benchmark", "throughput", "scalable", "leverage",
      "synergy", "stakeholder", "incentivize", "monetize", "capitalize",
      "proactive", "streamline", "onboarding", "workflow", "outsource",
      "rebrand", "upscale", "downsize", "franchise", "liquidate",
      "amortize", "depreciate", "arbitrage", "collateral", "dividend",
    ]);

    return {
      sensitivePatterns: [
        /^(?:fuck|shit|cunt|ass|bitch|nazi|rape|kill)/i,
      ],

      excludedDomains: [
        "trademark",
        "medical_condition",
        "slur",
        "medicine",
      ],

      technicalTerms,

      technicalFilters: [
        (word) => word.length < 3 || word.length > 12,
        (word) => /^[A-Z]/.test(word),
        (word) => /^[^a-zA-Z]/.test(word),
        (word) => /'s$/.test(word),
        (word) => /[0-9]/.test(word),
        (word) => /[-–—]/.test(word), // Hyphenated words
        (word) => technicalTerms.has(word.toLowerCase()),
      ],
    };
  }

  async getWordOfDay() {
    try {
      const response = await this.wordnikApi.get("/words.json/wordOfTheDay");
      const wordData = response.data;

      // Extract the most reliable parts
      const word = wordData.word.toLowerCase();
      let type = this.extractWordnikPOS(wordData.definitions[0]?.partOfSpeech);

      // Validate or default
      if (!this.isWordAcceptable(word) || !type) {
        console.log(`WOTD ${word} failed quality check, using fallback`);
        return this.getFallbackWord();
      }

      const wotd = {
        text: word,
        type,
        definition: wordData.definitions[0]?.text || null,
        score: 1000,
        source: "wordnik_wotd",
      };

      // Store history
      if (!this.wotdHistory.some((w) => w.text === word)) {
        this.wotdHistory.unshift(wotd);
        if (this.wotdHistory.length > 30) {
          this.wotdHistory.pop();
        }
      }

      return wotd;
    } catch (error) {
      console.error("WOTD fetch error:", error);
      return this.getFallbackWord();
    }
  }

  async getRecentWotds(count = 4) {
    // Ensure we have the current WOTD
    if (this.wotdHistory.length === 0) {
      await this.getWordOfDay();
    }

    return this.wotdHistory
      .slice(0, Math.min(count, this.wotdHistory.length))
      .filter((w) => this.isWordAcceptable(w.text));
  }

  async getRandomWords(count = 20, posCounts = null, excludeWords = []) {
    try {
      // Determine how many words of each type to get
      const posTargets = posCounts || {
        noun: Math.ceil(count * 0.4), // 40% nouns
        verb: Math.ceil(count * 0.3), // 30% verbs
        adj: Math.ceil(count * 0.3), // 30% adjectives
      };

      const excludeSet = new Set(excludeWords.map((w) => w.toLowerCase()));
      const results = {};
      const promises = [];

      // Make parallel requests for each POS
      for (const [pos, targetCount] of Object.entries(posTargets)) {
        // Request 3x the needed amount to allow for filtering
        const requestCount = targetCount * 3;

        // Map our internal POS names to Wordnik's
        const includePartOfSpeech =
          pos === "noun" ? "noun" : pos === "verb" ? "verb" : "adjective";

        const request = this.wordnikApi.get("/words.json/randomWords", {
          params: {
            limit: requestCount,
            minLength: 3,
            maxLength: 10,
            includePartOfSpeech,
            minCorpusCount: 5000,
            hasDictionaryDef: true,
          },
        });

        promises.push({ pos, promise: request });
      }

      // Process all requests
      for (const { pos, promise } of promises) {
        try {
          const response = await promise;

          // Filter and normalize words
          const validWords = response.data
            .filter((word) => {
              // Basic validation
              const wordText = word.word.toLowerCase();
              return (
                this.isWordAcceptable(wordText) && !excludeSet.has(wordText)
              );
            })
            .map((word) => ({
              text: word.word.toLowerCase(),
              type: pos,
              score: 800,
              source: "wordnik_random",
            }));

          results[pos] = validWords;
        } catch (err) {
          console.error(`Error fetching ${pos} words:`, err.message);
          results[pos] = []; // Empty array for this POS if there's an error
        }
      }

      // Take needed counts of each POS and combine
      const finalWords = [];

      for (const [pos, target] of Object.entries(posTargets)) {
        const posWords = (results[pos] || [])
          .sort(() => Math.random() - 0.5) // Shuffle
          .slice(0, target); // Take only what we need

        finalWords.push(...posWords);
      }

      // Final shuffle and return
      return finalWords.sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error("Error fetching random words:", error);
      return this.getEmergencyWords(count);
    }
  }

  isWordAcceptable(word) {
    // Convert to lowercase for consistent checking
    const text = word.toLowerCase();

    // Apply technical filters
    for (const filter of this.exclusionFilters.technicalFilters) {
      if (filter(text)) return false;
    }

    // Check against sensitive patterns
    for (const pattern of this.exclusionFilters.sensitivePatterns) {
      if (pattern.test(text)) return false;
    }

    return true;
  }

  extractWordnikPOS(pos) {
    if (!pos) return null;

    const posMap = {
      noun: "noun",
      verb: "verb",
      adjective: "adj",
      adverb: "adv",
    };

    return posMap[pos.toLowerCase()] || null;
  }

  async getDefinition(word) {
    try {
      const response = await this.wordnikApi.get(
        `/word.json/${encodeURIComponent(word)}/definitions`,
        { params: { limit: 1 } }
      );
      const def = response.data[0];
      if (def) {
        return {
          word,
          definition: def.text,
          partOfSpeech: this.extractWordnikPOS(def.partOfSpeech) || null,
        };
      }
      return { word, definition: null, partOfSpeech: null };
    } catch (error) {
      return { word, definition: null, partOfSpeech: null };
    }
  }

  getFallbackWord() {
    const nouns = poeticWords.noun;
    const word = nouns[Math.floor(Math.random() * nouns.length)];
    return {
      text: word,
      type: "noun",
      score: 500,
      source: "fallback",
    };
  }

  getEmergencyWords(count) {
    const allWords = [];
    for (const [pos, words] of Object.entries(poeticWords)) {
      const type = pos === "adj" ? "adj" : pos;
      for (const text of words) {
        allWords.push({ text, type, score: 500, source: "emergency" });
      }
    }

    // Shuffle and return requested count
    return allWords.sort(() => Math.random() - 0.5).slice(0, count);
  }
}

module.exports = new DictionaryService();
