const BASE_URL = "https://poetrydb.org";

class PoetryService {
  constructor() {
    this.cache = {
      dailyPoem: null,
      lastRefresh: null,
    };
  }

  getDayKey(date = new Date()) {
    // Convert to UTC to ensure consistent day boundaries
    return new Date(date.toUTCString()).toISOString().split("T")[0];
  }

  generateDailySeed(dateStr) {
    // Create a seed from the date
    const [year, month, day] = dateStr.split("-").map(Number);
    return ((year * 12 + month) * 31 + day) * 17; // Multiply by prime for better distribution
  }

  shouldRefreshCache() {
    if (!this.cache.lastRefresh || !this.cache.dailyPoem) return true;

    const currentDayKey = this.getDayKey();
    const lastRefreshDay = this.getDayKey(new Date(this.cache.lastRefresh));

    return currentDayKey !== lastRefreshDay;
  }

  async getDailyPoem() {
    try {
      // Check if we need to refresh the cache
      if (this.shouldRefreshCache()) {
        const today = this.getDayKey();
        const seed = this.generateDailySeed(today);

        // Get all authors
        const authorsResponse = await fetch(`${BASE_URL}/author`);
        const { authors } = await authorsResponse.json();

        // Select author using the seed
        const authorIndex = seed % authors.length;
        const selectedAuthor = authors[authorIndex];

        // Get poems by the selected author
        const poemsResponse = await fetch(
          `${BASE_URL}/author/${selectedAuthor}`
        );
        const poems = await poemsResponse.json();

        // Select poem using the seed
        const poemIndex = seed % poems.length;
        const poem = poems[poemIndex];

        // Update cache
        this.cache = {
          dailyPoem: {
            title: poem.title,
            author: poem.author,
            lines: poem.lines.filter((line) => line.trim() !== ""),
            refreshedAt: new Date().toISOString(),
          },
          lastRefresh: new Date().toISOString(),
        };
      }

      return this.cache.dailyPoem;
    } catch (error) {
      console.error("Error fetching daily poem:", error);
      // Return fallback poem
      return {
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
          "Grave men, near death, who see with blinding sight,",
          "Blind eyes could blaze like meteors and be gay,",
          "Rage, rage against the dying of the light.",
          "",
          "And you, my father, there on the sad height,",
          "Curse, bless, me now with your fierce tears, I pray.",
          "Do not go gentle into that good night.",
          "Rage, rage against the dying of the light.",
        ],
        refreshedAt: new Date().toISOString(),
      };
    }
  }

  async getPoems(page = 1, limit = 10) {
    try {
      const response = await fetch(`${BASE_URL}/random/${limit}`);
      const poems = await response.json();

      return poems.map((poem) => ({
        id: `${poem.author}-${poem.title}`.replace(/\s+/g, "-").toLowerCase(),
        title: poem.title,
        author: poem.author,
        preview: poem.lines.slice(0, 3).join(" "),
        lines: poem.lines,
      }));
    } catch (error) {
      console.error("Error fetching poems:", error);
      return [];
    }
  }
}

export const poetryService = new PoetryService();
