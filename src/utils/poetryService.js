const BASE_POETRYDB_URL = "https://poetrydb.org";

class PoetryDBService {
  async getRandomPoems(count = 1) {
    try {
      const response = await fetch(`${BASE_POETRYDB_URL}/random/${count}`);
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

class PoetsOrgService {
  constructor() {
    const baseApiUrl =
      window.location.hostname === "localhost" ? "http://localhost:5001" : "";
    this.baseUrl = `${baseApiUrl}/api/poetry/poetsorg`;
  }

  async getDailyPoem() {
    try {
      console.log("Requesting daily poem from poets.org");

      // Use a timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(this.baseUrl, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("poets.org response:", data);

        if (!data?.lines || data.lines.length === 0) {
          throw new Error("No poem found in poets.org response");
        }

        return {
          title: data.title || "Untitled",
          author: data.author || "Unknown",
          lines: data.lines,
          source: "poetsorg",
          year: new Date().getFullYear().toString(),
          refreshedAt: data.refreshedAt,
        };
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.error("Request to poets.org timed out");
      } else {
        console.error("Error fetching from poets.org:", error);
      }
      return null;
    }
  }
}

class CombinedPoetryService {
  constructor() {
    this.poetsorg = new PoetsOrgService();
    this.poetrydb = new PoetryDBService();
    this.cache = {
      dailyPoem: null,
      lastDailyRefresh: null,
    };
  }

  async getDailyPoem() {
    try {
      if (this.shouldRefreshDailyPoem()) {
        // First try poets.org
        const poetsorgPoem = await this.poetsorg.getDailyPoem();

        if (poetsorgPoem) {
          this.cache.dailyPoem = {
            ...poetsorgPoem,
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
