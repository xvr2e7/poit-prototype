const axios = require("axios");
const poeticWords = require("../data/poeticWords.json");
const { rejectReason } = require("./wordFilter");

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
    // What the last getRandomWords call turned away, and why (for logs and
    // the preview script).
    this.rejected = [];
  }

  async getWordOfDay() {
    try {
      const response = await this.wordnikApi.get("/words.json/wordOfTheDay");
      const wordData = response.data;

      // Judge the word as Wordnik spells it: a capital marks a name.
      const raw = wordData.word;
      const word = raw.toLowerCase();
      let type = this.extractWordnikPOS(wordData.definitions[0]?.partOfSpeech);

      const reason = rejectReason(raw);
      if (reason || !type) {
        console.log(`WOTD ${raw} rejected (${reason || "no part of speech"}), using fallback`);
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
      this.rejected = [];
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

          // Filter on the raw spelling, before lowercasing hides the
          // capitals that mark names and acronyms
          const validWords = response.data
            .filter((word) => {
              const reason = rejectReason(word.word);
              if (reason) {
                this.rejected.push({ word: word.word, reason });
                return false;
              }
              return !excludeSet.has(word.word);
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

  // Stored words are already lowercase; this re-checks them against the
  // blocklist and shape rules (it can't see capitals any more).
  isWordAcceptable(word) {
    return rejectReason(word) === null;
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
        if (rejectReason(text)) continue;
        allWords.push({ text, type, score: 500, source: "lexicon" });
      }
    }

    // Shuffle and return requested count
    return allWords.sort(() => Math.random() - 0.5).slice(0, count);
  }
}

module.exports = new DictionaryService();
