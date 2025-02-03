const axios = require("axios");

class WordnikService {
  constructor() {
    this.api = axios.create({
      baseURL: "https://api.wordnik.com/v4",
      timeout: 5000,
      headers: {
        api_key: process.env.WORDNIK_API_KEY,
      },
    });
  }

  async getWordOfDay() {
    try {
      const response = await this.api.get("/words.json/wordOfTheDay");
      const word = response.data;

      return {
        text: word.word.toLowerCase(),
        type: this.normalizePartOfSpeech(word.definitions[0]?.partOfSpeech),
        definition: word.definitions[0]?.text,
        score: 1000, // Highest priority
        source: "wordnik_wotd",
      };
    } catch (error) {
      console.error("WOTD fetch error:", error);
      throw error;
    }
  }

  normalizePartOfSpeech(pos) {
    const posMap = {
      noun: "noun",
      verb: "verb",
      adjective: "adj",
      adverb: "adv",
    };
    return posMap[pos] || "noun";
  }
}

module.exports = new WordnikService();
