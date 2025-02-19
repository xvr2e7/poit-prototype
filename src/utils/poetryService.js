const BASE_POETRYDB_URL = "https://poetrydb.org";

class Stands4Service {
  constructor() {
    this.baseUrl = `${import.meta.env.VITE_API_URL}/poetry/stands4`;
  }

  async getDailyPoem() {
    const query = this.getDailyQuery();

    try {
      const apiParams = {
        term: query,
        p: "poetry",
        format: "json",
      };

      console.log("Requesting daily STANDS4 poem with params:", apiParams);

      const queryParams = new URLSearchParams(apiParams);
      const response = await fetch(`${this.baseUrl}?${queryParams}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("STANDS4 raw response:", data); // Debug log

      if (!data?.result) {
        throw new Error("No poem found in STANDS4 response");
      }

      const poem = Array.isArray(data.result) ? data.result[0] : data.result;
      console.log("Raw poem data:", poem); // Debug log

      return this.formatPoem(poem);
    } catch (error) {
      console.error("Error fetching from STANDS4:", error);
      return null;
    }
  }

  formatPoem(poem) {
    if (!poem) return null;

    // Process author - now using poet field
    const author = poem.poet || poem.author || "Unknown";
    const cleanedAuthor = author === "null" ? "Unknown" : author.trim();

    // Process title
    const title = poem.title || "";
    const cleanedTitle = title === "null" ? "Untitled" : title.trim();

    // Full poem text processing
    let poemText = poem.poem || "";

    // Try to extract full text from different possible fields
    if (poem.full_text) {
      poemText = poem.full_text;
    } else if (poem.content) {
      poemText = poem.content;
    }

    poemText = poemText
      .replace(/\\n/g, "\n")
      .replace(/\r\n/g, "\n")
      .replace(/\\r\\n/g, "\n")
      .replace(/\n\s*\n/g, "\n")
      .trim();

    const lines = poemText
      .split("\n")
      .map((line) => {
        return line
          .trim()
          .replace(/^['"]|['"]$/g, "")
          .replace(/\\['\"]/g, "$1");
      })
      .filter((line) => line.length > 0);

    console.log("Formatted poem:", {
      title: cleanedTitle,
      author: cleanedAuthor,
      lineCount: lines.length,
      lines,
    });

    return {
      title: cleanedTitle,
      author: cleanedAuthor,
      lines,
      year: poem.year || "Unknown",
      source: "stands4",
    };
  }

  getDailyQuery() {
    // Mock list of keywords
    const queries = [
      "love",
      "light",
      "time",
      "dream",
      "hope",
      "life",
      "nature",
      "soul",
      "heart",
      "mind",
      "peace",
      "truth",
      "beauty",
      "freedom",
      "journey",
    ];

    const today = new Date();
    const seed =
      today.getFullYear() * 10000 +
      (today.getMonth() + 1) * 100 +
      today.getDate();

    return queries[seed % queries.length];
  }
}

class PoetryDBService {
  async getRandomPoems(count = 1) {
    try {
      const response = await fetch(`https://poetrydb.org/random/${count}`);
      const poems = await response.json();

      return poems.map((poem) => ({
        ...poem,
        lines: poem.lines.filter((line) => line.trim()),
        source: "poetrydb",
      }));
    } catch (error) {
      console.error("Error fetching from PoetryDB:", error);
      return [];
    }
  }
}

class CombinedPoetryService {
  constructor() {
    this.stands4 = new Stands4Service();
    this.poetrydb = new PoetryDBService();
    this.cache = {
      dailyPoem: null,
      lastDailyRefresh: null,
    };
  }

  async getDailyPoem() {
    try {
      if (this.shouldRefreshDailyPoem()) {
        // First try STANDS4
        const stands4Poem = await this.stands4.getDailyPoem();

        if (stands4Poem) {
          this.cache.dailyPoem = {
            ...stands4Poem,
            refreshedAt: new Date().toISOString(),
          };
        } else {
          // Fallback to PoetryDB
          const [poetrydbPoem] = await this.poetrydb.getRandomPoems(1);
          this.cache.dailyPoem = {
            ...poetrydbPoem,
            refreshedAt: new Date().toISOString(),
          };
        }

        this.cache.lastDailyRefresh = new Date().toISOString();
      }

      return this.cache.dailyPoem || this.getFallbackPoem();
    } catch (error) {
      console.error("Error fetching daily poem:", error);
      return this.getFallbackPoem();
    }
  }

  async getFeedPoems(count = 10) {
    // For feed, primarily use PoetryDB as it's better for bulk fetching
    const poems = await this.poetrydb.getRandomPoems(count);
    return poems.length > 0 ? poems : [this.getFallbackPoem()];
  }

  shouldRefreshDailyPoem() {
    if (!this.cache.lastDailyRefresh || !this.cache.dailyPoem) return true;

    const currentDate = new Date();
    const lastRefresh = new Date(this.cache.lastDailyRefresh);

    return (
      currentDate.getDate() !== lastRefresh.getDate() ||
      currentDate.getMonth() !== lastRefresh.getMonth() ||
      currentDate.getFullYear() !== lastRefresh.getFullYear()
    );
  }

  getFallbackPoem() {
    // final fallback poem
    return {
      id: "dylan-thomas-do-not-go-gentle",
      title: "Do not go gentle into that good night",
      author: "Dylan Thomas",
      lines: [
        "Do not go gentle into that good night,",
        "Old age should burn and rave at close of day;",
        "Rage, rage against the dying of the light.",
        "",
        "Though wise men at their end know dark is right,",
        "Because their words had forked no lightning they",
        "Do not go gentle into that good night.",
        "",
        "Good men, the last wave by, crying how bright",
        "Their frail deeds might have danced in a green bay,",
        "Rage, rage against the dying of the light.",
        "",
        "Wild men who caught and sang the sun in flight,",
        "And learn, too late, they grieved it on its way,",
        "Do not go gentle into that good night.",
        "",
        "Grave men, near death, who see with blinding sight",
        "Blind eyes could blaze like meteors and be gay,",
        "Rage, rage against the dying of the light.",
        "",
        "And you, my father, there on the sad height,",
        "Curse, bless, me now with your fierce tears, I pray.",
        "Do not go gentle into that good night.",
        "Rage, rage against the dying of the light.",
      ],
      source: "fallback",
      year: "1947",
      refreshedAt: new Date().toISOString(),
    };
  }
}

export const poetryService = new CombinedPoetryService();
