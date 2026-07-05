const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

const OPENROUTER_MODEL = "meta-llama/llama-3.3-70b-instruct:free";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

class LLMClient {
  constructor() {
    this.genAI = process.env.GEMINI_API_KEY
      ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      : null;

    this.openRouterKey = process.env.OPENROUTER_API_KEY || null;
  }

  /**
   * Generate text from an LLM. Tries Gemini first, falls back to OpenRouter.
   * @param {string} prompt - The user prompt text
   * @param {object} options
   * @param {number} options.temperature - Sampling temperature
   * @param {number} options.maxTokens - Max output tokens
   * @param {string} options.label - Label for logging
   * @returns {string} The generated text response
   */
  async generate(prompt, { temperature = 0.7, maxTokens = 2048, label = "LLM" } = {}) {
    const errors = [];

    // 1. Try Gemini with retry
    if (this.genAI) {
      try {
        return await this._tryGemini(prompt, { temperature, maxTokens, label });
      } catch (error) {
        errors.push(`Gemini: ${error.message}`);
        console.warn(`${label}: Gemini failed, trying OpenRouter...`);
      }
    }

    // 2. Try OpenRouter
    if (this.openRouterKey) {
      try {
        return await this._tryOpenRouter(prompt, { temperature, maxTokens, label });
      } catch (error) {
        errors.push(`OpenRouter: ${error.message}`);
        console.warn(`${label}: OpenRouter failed: ${error.message}`);
      }
    }

    // 3. Both failed
    const available = [
      this.genAI ? "Gemini" : null,
      this.openRouterKey ? "OpenRouter" : null,
    ].filter(Boolean);

    if (available.length === 0) {
      throw new Error(`${label}: No LLM providers configured (set GEMINI_API_KEY or OPENROUTER_API_KEY)`);
    }

    throw new Error(`${label}: All providers failed — ${errors.join("; ")}`);
  }

  async _tryGemini(prompt, { temperature, maxTokens, label }) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature, maxOutputTokens: maxTokens },
        });
        return result.response.text().trim();
      } catch (error) {
        const is429 = error.message?.includes("429") || error.status === 429;

        if (!is429 || attempt === maxRetries) throw error;

        // Daily quota = non-retryable
        if (error.message?.includes("PerDay")) {
          console.warn(`${label}: Gemini daily quota exhausted`);
          throw error;
        }

        // Serverless budget: a long suggested backoff means "not now" —
        // fail over to OpenRouter instead of sleeping the function away.
        const retryMatch = error.message?.match(/retry in ([\d.]+)s/i);
        const suggested = retryMatch ? parseFloat(retryMatch[1]) : Math.pow(2, attempt + 1);
        if (suggested > 5) {
          console.warn(`${label}: Gemini backoff ${suggested}s too long, failing over`);
          throw error;
        }
        const delay = suggested;

        console.log(`${label}: Gemini rate limited, retrying in ${delay}s (${attempt + 1}/${maxRetries})`);
        await new Promise((r) => setTimeout(r, delay * 1000));
      }
    }
  }

  async _tryOpenRouter(prompt, { temperature, maxTokens, label }) {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: OPENROUTER_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature,
        max_tokens: maxTokens,
      },
      {
        headers: {
          Authorization: `Bearer ${this.openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://poit.xzyan.com",
          "X-Title": "POiT",
        },
        timeout: 15000,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("Empty response from OpenRouter");

    console.log(`${label}: Used OpenRouter (${OPENROUTER_MODEL})`);
    return text;
  }
}

module.exports = new LLMClient();
