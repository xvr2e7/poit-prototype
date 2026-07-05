const llm = require("../utils/llmClient");

class SeedPoemService {
  async generateDailyPoems(wordPool, count = 10) {
    try {
      const wordTexts = wordPool.map((w) => w.text);

      const prompt = `You are a skilled poet. Create ${count} short, evocative poems (2-8 lines each).

RULES:
- Each poem MUST naturally use 3-8 words from this pool: ${wordTexts.join(", ")}
- Mark each used pool word with **bold** markdown (e.g., "the **moonlight** fell")
- Vary the forms: include haiku (5-7-5), free verse, couplets, fragments, and quatrains
- Each poem needs a short, evocative title
- Poems should feel genuine and emotionally resonant, not forced
- Use line breaks (\\n) to separate lines within a poem
- Do NOT add pool words awkwardly — they must flow naturally
- Aim for imagery, emotion, and musicality

Respond ONLY with a valid JSON array, no markdown fences:
[{"title": "Example Title", "content": "first line with **word**\\nsecond line", "usedPoolWords": ["word"]}]`;

      const responseText = await llm.generate(prompt, {
        temperature: 0.9,
        maxTokens: 4096,
        label: "Seed poem generation",
      });

      const cleaned = responseText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "");

      const poems = JSON.parse(cleaned);

      // Validate and format
      const validPoems = poems
        .filter(
          (p) =>
            p.title &&
            p.content &&
            Array.isArray(p.usedPoolWords) &&
            p.usedPoolWords.length >= 2
        )
        .map((p, i) => ({
          id: `seed-${Date.now()}-${i}`,
          title: p.title,
          content: p.content,
          usedPoolWords: p.usedPoolWords,
          source: "seed",
          createdAt: new Date().toISOString(),
        }));

      console.log(
        `Generated ${validPoems.length} seed poems from ${wordTexts.length} pool words`
      );

      return validPoems.length >= 3 ? validPoems : this.getFallbackPoems(wordPool);
    } catch (error) {
      console.error("Seed poem generation error:", error.message);
      return this.getFallbackPoems(wordPool);
    }
  }

  getFallbackPoems(wordPool) {
    const words = wordPool.map((w) => w.text);
    const nouns = wordPool.filter((w) => w.type === "noun").map((w) => w.text);
    const verbs = wordPool.filter((w) => w.type === "verb").map((w) => w.text);
    const adjs = wordPool.filter((w) => w.type === "adj").map((w) => w.text);

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)] || words[0];

    const poems = [
      {
        title: "Morning Fragment",
        content: `**${pick(adjs)}** light on **${pick(nouns)}**\na **${pick(nouns)}** that **${pick(verbs)}**s\nthrough the silence`,
        usedPoolWords: [],
      },
      {
        title: "Small Hours",
        content: `I **${pick(verbs)}** what the **${pick(nouns)}** cannot hold—\n**${pick(adjs)}** and **${pick(adjs)}**,\nlike **${pick(nouns)}** before rain`,
        usedPoolWords: [],
      },
      {
        title: "Threshold",
        content: `between **${pick(nouns)}** and **${pick(nouns)}**\nthe **${pick(adjs)}** space\nwhere everything **${pick(verbs)}**s`,
        usedPoolWords: [],
      },
      {
        title: "What Remains",
        content: `**${pick(nouns)}** of **${pick(nouns)}**\n**${pick(verbs)}**ing slowly—\n**${pick(adjs)}** and still`,
        usedPoolWords: [],
      },
      {
        title: "Evening",
        content: `the **${pick(nouns)}** **${pick(verbs)}**s\ninto **${pick(adjs)}** **${pick(nouns)}**\nwe do not speak`,
        usedPoolWords: [],
      },
    ];

    return poems.map((p, i) => ({
      id: `seed-fallback-${Date.now()}-${i}`,
      ...p,
      source: "seed-fallback",
      createdAt: new Date().toISOString(),
    }));
  }
}

module.exports = new SeedPoemService();
