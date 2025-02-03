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

      const allKeywords = new Set();
      const sourceKeywords = new Map();

      for (const category of categories) {
        try {
          console.log(`\nFetching ${category} news...`);
          const response = await this.api.get("/top-headlines", {
            params: {
              country: "us",
              category,
              pageSize: 5, // Limit to top 5 articles per category
            },
          });

          const categoryKeywords = new Set();
          response.data.articles.forEach((article) => {
            const text = `${article.title} ${article.description || ""}`;
            const words = text
              .toLowerCase()
              .replace(/[^a-z\s-]/g, "") // Remove all non-letter characters except hyphens
              .split(/\s+/)
              .filter((word) => this.isGoodTopic(word));

            words.forEach((word) => {
              categoryKeywords.add(word);
              allKeywords.add(word);
            });
          });

          sourceKeywords.set(category, Array.from(categoryKeywords));
          console.log(`Found ${categoryKeywords.size} keywords in ${category}`);

          // Respect rate limits
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error fetching ${category} news:`, error);
          continue;
        }
      }

      // Select final topics, prioritizing diversity across categories
      const finalTopics = this.selectDiverseTopics(sourceKeywords, 10);
      console.log("\nFinal selected topics:", finalTopics.join(", "));

      return finalTopics;
    } catch (error) {
      console.error("Error fetching news:", error);
      return this.getFallbackTopics();
    }
  }

  selectDiverseTopics(sourceKeywords, targetCount) {
    const selected = new Set();
    const categories = Array.from(sourceKeywords.keys());
    let currentIndex = 0;

    // Keep selecting words until we reach target count
    while (selected.size < targetCount && currentIndex < 50) {
      // Rotate through categories
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
    // Basic validation
    if (!word || word.length < 4 || word.length > 12) return false;
    if (!/^[a-z]+$/.test(word)) return false;

    // Skip sensitive topics and common words
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

      // Creative Activities
      "craft",
      "paint",
      "write",
      "build",
      "imagine",

      // Natural World
      "flower",
      "river",
      "mountain",
      "breeze",
      "crystal",

      // Positive Emotions
      "wonder",
      "dream",
      "smile",
      "laugh",
      "play",
    ];
  }
}

module.exports = new NewsService();
