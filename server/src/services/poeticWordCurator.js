const llm = require("../utils/llmClient");

class PoeticWordCurator {
  async curateWords(rawWords) {
    try {
      const wordList = rawWords.map((w) => w.text).join(", ");

      const prompt = `You are a poetry word curator. Score each word from 1-10 for poetic quality based on:
- Evocative imagery (does it paint a picture?)
- Emotional resonance (does it stir feeling?)
- Sensory richness (does it engage the senses?)
- Sound quality / euphony (is it pleasant to say?)
- Versatility in poetic contexts

Score LOW (1-4) for: technical jargon, overly academic words, words with no imagery, brand names, abbreviations, awkward-sounding words, commerce, law, sport and office words.
Score 1 for: proper nouns and their adjectives (names of people, places, peoples, languages, tribes, brands), abbreviations and fragments, and anything about violence, weapons, crime, disaster, death in a graphic sense, sex, drugs, disease, or slurs. Strangers share this pool every day; it must be safe and gentle to write with.
Score HIGH (7-10) for: nature words, sensory words, emotionally charged words, words with beautiful sounds, words that spark imagination, plain everyday words with a strong image (kettle, harbor, linen).

Score every word in the list exactly once.

Words: ${wordList}

Respond ONLY with a valid JSON array, no markdown, no explanation:
[{"word": "example", "score": 7}]`;

      const responseText = await llm.generate(prompt, {
        temperature: 0.3,
        maxTokens: 4096,
        label: "Word curation",
      });

      // Models sometimes wrap the array in prose or code fences
      const start = responseText.indexOf("[");
      const end = responseText.lastIndexOf("]");
      if (start === -1 || end <= start) throw new Error("no JSON array in curation response");
      const scores = JSON.parse(responseText.slice(start, end + 1));

      // Build a score map
      const scoreMap = new Map();
      for (const item of scores) {
        if (item.word && typeof item.score === "number") {
          scoreMap.set(item.word.toLowerCase(), item.score);
        }
      }

      // Attach scores to original word objects
      const scoredWords = rawWords
        .map((w) => ({
          ...w,
          // a word the model skipped is unreviewed, so it stays out
          poeticScore: scoreMap.get(w.text.toLowerCase()) ?? 0,
        }))
        .filter((w) => w.poeticScore >= 6)
        .sort((a, b) => b.poeticScore - a.poeticScore);

      console.log(
        `Word curation: ${rawWords.length} words in → ${scoredWords.length} words out (score >= 6)`
      );

      return scoredWords;
    } catch (error) {
      console.error("Word curation error:", error.message);
      return null;
    }
  }
}

module.exports = new PoeticWordCurator();
