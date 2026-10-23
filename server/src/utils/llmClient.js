const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

// Model ids are retired on the providers' schedule, not ours: in 2026
// both hard-coded ids ("gemini-2.0-flash", "meta-llama/llama-3.3-70b-
// instruct:free") began returning 404, and every LLM feature (word curation,
// seed poems, prompts) fell back silently. Use a rolling alias and let the
// environment override either id without a code change. GEMINI_MODELS is
// an ordered list: when the first is overloaded (503), the next is tried.
// The lite alias answers in seconds; the full flash alias thinks first and
// took 60-120 s in testing, past the 30 s function budget, so it's second.
const GEMINI_MODELS = (process.env.GEMINI_MODELS || process.env.GEMINI_MODEL || "gemini-flash-lite-latest,gemini-flash-latest")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 12000;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "google/gemma-4-31b-it:free";
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

  async _tryGemini(prompt, options) {
    let lastError;
    for (const id of GEMINI_MODELS) {
      try {
        return await this._tryGeminiModel(id, prompt, options);
      } catch (error) {
        lastError = error;
        const overloaded =
          /\b(500|503)\b|timed? ?out|abort/i.test(error.message || "") || [500, 503].includes(error.status);
        const retired = /\b404\b/.test(error.message || "") || error.status === 404;
        if (!overloaded && !retired) throw error;
        console.warn(`${options.label}: Gemini ${id} unavailable (${overloaded ? "overloaded" : "not found"}), trying the next model`);
      }
    }
    throw lastError;
  }

  async _tryGeminiModel(id, prompt, { temperature, maxTokens, label }) {
    const model = this.genAI.getGenerativeModel({ model: id }, { timeout: GEMINI_TIMEOUT_MS });

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
