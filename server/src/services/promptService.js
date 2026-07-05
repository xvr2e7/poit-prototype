const llm = require("../utils/llmClient");

class PromptService {
  async generateDailyPrompt(wordPool) {
    try {
      const wordTexts = wordPool.map((w) => w.text).join(", ");

      const prompt = `You are a creative writing instructor. Given this word pool: ${wordTexts}

Generate a daily writing prompt for a poetry app. The prompt should:
- Be evocative and open-ended, not prescriptive
- Inspire imagery and emotion
- Be 1-2 sentences
- Feel like an invitation, not an assignment

Also suggest a one-word theme and pick 3 words from the pool that relate to the theme.

Also generate 3 short "spark" micro-lines (fragments of poetry, 4-8 words each) that use words from the pool naturally. These should be evocative starting points, not complete poems.

Respond ONLY with valid JSON, no markdown:
{"prompt": "...", "theme": "...", "suggestedWords": ["word1", "word2", "word3"], "sparks": ["spark line 1", "spark line 2", "spark line 3"]}`;

      const responseText = await llm.generate(prompt, {
        temperature: 0.9,
        maxTokens: 512,
        label: "Prompt generation",
      });

      const cleaned = responseText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "");

      const data = JSON.parse(cleaned);

      if (!data.prompt || !data.theme) {
        return this.getFallbackPrompt(wordPool);
      }

      return {
        prompt: data.prompt,
        theme: data.theme,
        suggestedWords: data.suggestedWords || [],
        sparks: data.sparks || [],
      };
    } catch (error) {
      console.error("Prompt generation error:", error.message);
      return this.getFallbackPrompt(wordPool);
    }
  }

  getFallbackPrompt(wordPool) {
    const prompts = [
      "What does the space between two breaths hold?",
      "Write about something you lost that you're glad is gone.",
      "Describe a color without naming it.",
      "What would silence say if it could speak?",
      "Write a letter to a place you've never been.",
      "What does water remember?",
      "Describe the weight of a secret.",
      "What happens to words after they're spoken?",
    ];

    const themes = [
      "memory", "absence", "light", "silence",
      "threshold", "longing", "transformation", "home",
    ];

    const idx = Math.floor(Math.random() * prompts.length);
    const words = wordPool.map((w) => w.text);
    const suggested = words.sort(() => Math.random() - 0.5).slice(0, 3);

    return {
      prompt: prompts[idx],
      theme: themes[idx],
      suggestedWords: suggested,
      sparks: [
        `the ${suggested[0] || "light"} of what remains`,
        `between ${suggested[1] || "silence"} and breath`,
        `where ${suggested[2] || "shadows"} begin to speak`,
      ],
    };
  }
}

module.exports = new PromptService();
