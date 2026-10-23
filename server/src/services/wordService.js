const dictionaryService = require("./dictionaryService");
const poeticWordCurator = require("./poeticWordCurator");
const { rejectReason } = require("./wordFilter");

const POOL_SIZE = 50;

class WordService {
  /**
   * Build one day's pool. Reads from Wordnik and the language model only;
   * it never touches the database (the route stores the result).
   *
   * Random dictionary words are only a pool of candidates: they reach poets
   * only after the model has scored them. If the model can't be reached,
   * the day is filled from the hand-picked lexicon instead. Unreviewed
   * random words never ship, because that is how "kidnapping" and "ammo"
   * got in.
   */
  async getWords() {
    try {
      const wordMap = new Map();
      const add = (word) => {
        if (wordMap.size < POOL_SIZE && !wordMap.has(word.text) && !rejectReason(word.text)) {
          wordMap.set(word.text, word);
        }
      };

      // 1. Word of the Day + recent ones (editor-picked, already filtered)
      const wotdCount = 5;
      add(await dictionaryService.getWordOfDay());
      for (const word of await dictionaryService.getRecentWotds(wotdCount - 1)) add(word);

      // 2. ~100 filtered random candidates for the model to score
      const randomWordCount = Math.max(0, 100 - wordMap.size);
      const posCounts = {
        noun: Math.ceil(randomWordCount * 0.4),
        verb: Math.ceil(randomWordCount * 0.3),
        adj: Math.ceil(randomWordCount * 0.3),
      };
      const candidates = await dictionaryService.getRandomWords(
        Math.ceil(randomWordCount * 1.5),
        posCounts,
        Array.from(wordMap.keys())
      );

      // 3. Only model-approved candidates go in
      const curated = await poeticWordCurator.curateWords(candidates);
      if (curated) {
        for (const word of curated) add(word);
      } else {
        console.warn("Word curation unavailable: filling today's pool from the lexicon, not raw random words");
      }

      // 4. Top up from the lexicon
      if (wordMap.size < POOL_SIZE) {
        for (const word of dictionaryService.getEmergencyWords(POOL_SIZE * 2)) add(word);
      }

      return Array.from(wordMap.values()).sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error("Error in WordService:", error);
      return dictionaryService.getEmergencyWords(POOL_SIZE);
    }
  }
}

module.exports = new WordService();
