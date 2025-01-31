const axios = require("axios");

class DatamuseService {
  constructor() {
    this.api = axios.create({
      baseURL: "https://api.datamuse.com",
      timeout: 5000,
    });
  }

  async getWords() {
    try {
      console.log("Starting word fetch...");
      const wordPool = new Map();

      // Get topics from news
      const topics = await this.getNewsTopics();
      console.log("Today's topics from news:", topics);

      // Get words for each topic
      for (const topic of topics) {
        try {
          // Get meaning-related words
          const relatedWords = await this.getRelatedWords(topic);
          // Get trigger words (associations)
          const triggerWords = await this.getTriggerWords(topic);

          [...relatedWords, ...triggerWords].forEach((word) => {
            if (this.isQualityWord(word)) {
              wordPool.set(word.word.toLowerCase(), {
                ...word,
                source: topic,
              });
            }
          });

          // API rate limit pause
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error processing topic ${topic}:`, error);
          continue;
        }
      }

      // Balance word types (ensure good mix of nouns, verbs, adjectives)
      await this.balanceWordTypes(wordPool);

      const finalWords = Array.from(wordPool.values());
      console.log(`Fetched ${finalWords.length} unique words`);
      return finalWords;
    } catch (error) {
      console.error("Word fetching error:", error);
      throw error;
    }
  }

  async getNewsTopics() {
    try {
      // Fetch from multiple categories to get diverse topics
      const categories = [
        "technology",
        "entertainment",
        "science",
        "health",
        "sports",
        "business",
      ];

      let allKeywords = new Set();

      for (const category of categories) {
        try {
          const response = await axios.get(
            `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${process.env.NEWS_API_KEY}`
          );

          const keywords = response.data.articles.flatMap((article) => {
            // Extract words from both title and description
            const text = `${article.title} ${article.description || ""}`;
            return text
              .toLowerCase()
              .split(/\W+/)
              .filter((word) => this.isGoodTopic(word));
          });

          keywords.forEach((word) => allKeywords.add(word));

          // Respect API rate limits
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error fetching ${category} news:`, error);
          continue;
        }
      }

      // Convert Set to array and take top 15 keywords
      return Array.from(allKeywords).slice(0, 15);
    } catch (error) {
      console.error("Error fetching news:", error);
      return this.getFallbackTopics();
    }
  }

  async isGoodTopic(word) {
    // Basic validation
    if (!word || word.length < 3 || word.length > 15) return false;
    if (!/^[a-z]+$/.test(word)) return false;

    // Skip stop words and common words
    if (this.isStopWord(word) || this.isCommonWord(word)) return false;

    // Skip potentially sensitive topics
    const sensitiveTopics = new Set([
      // Political terms
      "democrat",
      "republican",
      "election",
      "campaign",
      "poll",
      "vote",
      "congress",
      "senate",
      "politics",
      "politician",
      "political",
      // Controversial topics
      "war",
      "conflict",
      "crisis",
      "protest",
      "controversy",
      "scandal",
      "lawsuit",
      "investigation",
      "allegations",
      "dispute",
      // Negative news terms
      "death",
      "dead",
      "kill",
      "die",
      "crash",
      "accident",
      "disaster",
      "emergency",
      "crisis",
      "victim",
      "tragedy",
      "tragic",
      "fatal",
      // Economic anxiety terms
      "recession",
      "inflation",
      "unemployment",
      "deficit",
      "debt",
      // Generic news terms
      "breaking",
      "latest",
      "update",
      "news",
      "report",
      "official",
      "statement",
      "announce",
      "announced",
      "announces",
    ]);

    if (sensitiveTopics.has(word)) return false;

    // Ensure word is meaningful
    const minimumFrequency = 100; // Arbitrary threshold
    const response = await this.api.get("/words", {
      params: {
        sp: word,
        md: "f",
        max: 1,
      },
    });

    if (response.data.length > 0 && response.data[0].freq < minimumFrequency) {
      return false;
    }

    return true;
  }

  getFallbackTopics() {
    return [
      // Innovation & Discovery
      "innovation",
      "discovery",
      "explore",
      "create",
      "design",
      // Nature & Environment
      "garden",
      "forest",
      "ocean",
      "weather",
      "sunrise",
      // Daily Life & Culture
      "coffee",
      "music",
      "dance",
      "food",
      "travel",
      // Technology & Science
      "robot",
      "space",
      "digital",
      "mobile",
      "solar",
      // Arts & Entertainment
      "movie",
      "concert",
      "book",
      "game",
      "story",
      // Positive Changes
      "improve",
      "grow",
      "learn",
      "achieve",
      "inspire",
    ];
  }

  async getRelatedWords(topic) {
    const response = await this.api.get("/words", {
      params: {
        ml: topic, // "means like" - words with similar meaning
        md: "pf", // Include parts of speech and frequency
        max: 40,
      },
    });
    return response.data;
  }

  async getTriggerWords(topic) {
    const response = await this.api.get("/words", {
      params: {
        rel_trg: topic, // Words triggered by/associated with the topic
        md: "pf",
        max: 30,
      },
    });
    return response.data;
  }

  async balanceWordTypes(wordPool) {
    const types = { n: "nouns", v: "verbs", adj: "adjectives" };
    const minPerType = 15;

    for (const [type, name] of Object.entries(types)) {
      const typeCount = Array.from(wordPool.values()).filter((w) =>
        w.tags?.includes(type)
      ).length;

      if (typeCount < minPerType) {
        console.log(`Fetching more ${name}, current count: ${typeCount}`);
        try {
          const response = await this.api.get("/words", {
            params: {
              md: "pf",
              pos: type,
              min_freq: 1000, // Fairly common words
              max: minPerType * 2,
            },
          });

          response.data.forEach((word) => {
            if (this.isQualityWord(word)) {
              wordPool.set(word.word.toLowerCase(), word);
            }
          });
        } catch (error) {
          console.error(`Error balancing ${name}:`, error);
        }
      }
    }
  }

  isQualityWord(word) {
    if (!word?.word) return false;

    const w = word.word.toLowerCase();

    // Basic validation
    if (!/^[a-z-]+$/.test(w)) return false;
    if (w.length < 3 || w.length > 12) return false;

    // Check for valid part of speech
    const validTags = ["n", "v", "adj"];
    if (!word.tags?.some((tag) => validTags.includes(tag))) return false;

    // Avoid stop words and common words
    if (this.isStopWord(w) || this.isCommonWord(w)) return false;

    return true;
  }

  isStopWord(word) {
    const stopWords = new Set([
      "the",
      "be",
      "to",
      "of",
      "and",
      "a",
      "in",
      "that",
      "have",
      "i",
      "it",
      "for",
      "not",
      "on",
      "with",
      "he",
      "as",
      "you",
      "do",
      "at",
      "this",
      "but",
      "his",
      "by",
      "from",
      "they",
      "we",
      "say",
      "her",
      "she",
      "or",
      "an",
      "will",
      "my",
      "one",
      "all",
      "would",
      "there",
      "their",
      "what",
      "so",
      "up",
      "out",
      "if",
      "about",
      "who",
      "get",
      "which",
      "go",
      "me",
    ]);
    return stopWords.has(word.toLowerCase());
  }

  isCommonWord(word) {
    const commonWords = new Set([
      "people",
      "time",
      "year",
      "thing",
      "day",
      "man",
      "world",
      "life",
      "hand",
      "part",
      "child",
      "eye",
      "woman",
      "place",
      "work",
      "week",
      "case",
      "point",
      "fact",
      "group",
      "number",
      "good",
      "first",
      "last",
      "long",
      "great",
      "little",
      "own",
      "other",
      "old",
      "right",
      "big",
      "high",
      "different",
      "small",
      "large",
      "next",
      "early",
      "young",
      "important",
      "few",
      "public",
      "same",
      "able",
    ]);
    return commonWords.has(word.toLowerCase());
  }
}

module.exports = new DatamuseService();
