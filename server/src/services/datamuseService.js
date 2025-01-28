const axios = require("axios");

class DatamuseService {
  constructor() {
    this.api = axios.create({
      baseURL: "https://api.datamuse.com",
    });
  }

  async getWords() {
    try {
      console.log("Starting Datamuse word fetch...");
      // Get a larger pool of words related to some poetic themes (TODO: Diversify/Randomize themes?)
      const themes = [
        "nature",
        "life",
        "time",
        "dream",
        "heart",
        "light",
        "night",
      ];

      console.log("Fetching words for themes:", themes);
      const promises = themes.map((theme) =>
        this.api.get("/words", {
          params: {
            ml: theme,
            max: 50,
          },
        })
      );

      const responses = await Promise.all(promises);
      const allWords = responses.flatMap((response) => response.data);
      console.log(`Total words fetched: ${allWords.length}`);

      // Process and deduplicate words
      const uniqueWords = Array.from(
        new Map(
          allWords.map((word) => [
            word.word,
            {
              text: word.word,
              score: word.score,
            },
          ])
        ).values()
      );
      console.log(`Unique words after processing: ${uniqueWords.length}`);

      // Log some sample words
      console.log("Sample words:", uniqueWords.slice(0, 5));

      return uniqueWords;
    } catch (error) {
      console.error("Datamuse API Error:", error);
      throw error;
    }
  }
}

module.exports = new DatamuseService();
