const axios = require("axios");

class NewsService {
  constructor() {
    this.api = axios.create({
      baseURL: "https://newsapi.org/v2",
      timeout: 5000,
      headers: {
        "X-Api-Key": process.env.NEWS_API_KEY,
      },
    });
  }

  async getNewsTopics() {
    try {
      console.log("\n=== Fetching News Topics ===");

      // Focus on uplifting and creative categories
      const categories = ["technology", "science", "entertainment", "sports"];
      if (!process.env.NEWS_API_KEY) {
        console.log("No NEWS_API_KEY found, using fallback topics");
        return this.getFallbackTopics();
      }

      const allKeywords = new Set();
      const sourceKeywords = new Map();

      for (const category of categories) {
        try {
          console.log(`\nFetching ${category} news...`);
          const response = await this.api.get("/top-headlines", {
            params: {
              country: "us",
              category,
              pageSize: 5,
            },
          });

          if (!response.data || !response.data.articles) {
            console.log(`No articles found for ${category}`);
            continue;
          }

          const categoryKeywords = new Set();
          response.data.articles.forEach((article) => {
            if (!article.title && !article.description) return;

            const text = `${article.title || ""} ${article.description || ""}`;
            const words = text
              .toLowerCase()
              .replace(/[^a-z\s-]/g, "")
              .split(/\s+/)
              .filter((word) => this.isGoodTopic(word));

            words.forEach((word) => {
              categoryKeywords.add(word);
              allKeywords.add(word);
            });
          });

          sourceKeywords.set(category, Array.from(categoryKeywords));
          console.log(`Found ${categoryKeywords.size} keywords in ${category}`);

          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error fetching ${category} news:`, error.message);
          continue;
        }
      }

      const finalTopics = this.selectDiverseTopics(sourceKeywords, 10);

      if (finalTopics.length === 0) {
        console.log("No topics found from news API, using fallback topics");
        return this.getFallbackTopics();
      }

      console.log("\nFinal selected topics:", finalTopics.join(", "));
      return finalTopics;
    } catch (error) {
      console.error("Error fetching news:", error.message);
      return this.getFallbackTopics();
    }
  }

  selectDiverseTopics(sourceKeywords, targetCount) {
    const selected = new Set();
    const categories = Array.from(sourceKeywords.keys());
    let currentIndex = 0;

    while (selected.size < targetCount && currentIndex < 50) {
      for (const category of categories) {
        const keywords = sourceKeywords.get(category);
        if (keywords && keywords[currentIndex]) {
          selected.add(keywords[currentIndex]);
        }
        if (selected.size >= targetCount) break;
      }
      currentIndex++;
    }

    return Array.from(selected);
  }

  isGoodTopic(word) {
    if (!word || word.length < 4 || word.length > 12) return false;
    if (!/^[a-z]+$/.test(word)) return false;
    if (this.isSensitiveTopic(word) || this.isCommonWord(word)) return false;
    return true;
  }

  isSensitiveTopic(word) {
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

      // Social issues
      "racism",
      "discrimination",
      "inequality",
      "poverty",
      "violence",

      // Health anxiety
      "virus",
      "pandemic",
      "outbreak",
      "infection",
      "disease",

      // Climate anxiety
      "disaster",
      "catastrophe",
      "crisis",
      "extinction",

      // Crime and violence
      "murder",
      "assault",
      "attack",
      "violent",
      "crime",
      "criminal",

      // Divisive terms
      "controversial",
      "debate",
      "dispute",
      "opposing",
      "versus",
    ]);

    return sensitiveTopics.has(word);
  }

  isCommonWord(word) {
    const commonWords = new Set([
      // Articles and determiners
      "the",
      "a",
      "an",

      // Pronouns
      "he",
      "she",
      "it",
      "they",
      "we",
      "you",
      "who",
      "what",
      "which",

      // Prepositions
      "in",
      "on",
      "at",
      "to",
      "for",
      "with",
      "by",
      "from",
      "about",

      // Conjunctions
      "and",
      "but",
      "or",
      "nor",
      "yet",
      "so",

      // Auxiliary verbs
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",

      // Common adjectives
      "new",
      "good",
      "high",
      "old",
      "great",
      "big",
      "small",
      "large",
      "long",
      "little",
      "own",
      "other",
      "same",

      // Common adverbs
      "now",
      "then",
      "there",
      "here",
      "just",
      "only",
      "very",

      // Common nouns
      "time",
      "year",
      "day",
      "thing",
      "man",
      "woman",
      "child",
      "world",
      "life",
      "hand",
      "part",
      "eye",
      "place",
      "work",
      "week",
      "case",
      "point",
      "group",
      "number",
      "fact",

      // Internet/tech common words
      "click",
      "share",
      "like",
      "post",
      "tweet",
      "follow",

      // Business common words
      "business",
      "company",
      "market",
      "industry",

      // Common verbs
      "say",
      "get",
      "make",
      "go",
      "know",
      "take",
      "see",
      "come",
      "think",
      "look",
      "want",
      "give",
      "use",
      "find",
      "tell",
      "ask",
      "try",
      "call",

      // Time-related
      "today",
      "yesterday",
      "tomorrow",
      "week",
      "month",
      "year",

      // Quantities
      "many",
      "much",
      "some",
      "any",
      "every",
      "all",
      "both",
      "few",
      "several",
      "whole",
      "more",
      "most",
      "none",
      "some",

      // Locations
      "home",
      "house",
      "room",
      "office",
      "building",
      "city",
      "country",

      // People
      "person",
      "people",
      "family",
      "friend",
      "member",
      "leader",
      "student",

      // Generic descriptors
      "way",
      "thing",
      "type",
      "kind",
      "style",
      "sort",
      "form",
      "example",
    ]);

    return commonWords.has(word.toLowerCase());
  }

  getFallbackTopics() {
    const fallbackTopics = [
      "discover",
      "explore",
      "create",
      "design",
      "garden",
      "forest",
      "ocean",
      "sunrise",
      "music",
      "dance",
      "story",
      "robot",
      "space",
      "digital",
      "craft",
      "paint",
      "write",
      "build",
      "imagine",
    ];

    // Randomize and return a subset
    return fallbackTopics.sort(() => Math.random() - 0.5).slice(0, 10);
  }
}

module.exports = new NewsService();
