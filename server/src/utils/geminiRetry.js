/**
 * Wraps a Gemini API call with retry logic for transient 429 errors.
 * Retries up to `maxRetries` times with exponential backoff.
 * Returns null on non-retryable 429s (e.g. daily quota exhausted).
 */
async function withGeminiRetry(fn, { maxRetries = 2, label = "Gemini" } = {}) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const is429 = error.message?.includes("429") || error.status === 429;

      if (!is429 || attempt === maxRetries) {
        throw error;
      }

      // Check if it's a daily quota (non-retryable) vs per-minute (retryable)
      const isDailyQuota = error.message?.includes("PerDay");
      if (isDailyQuota) {
        console.warn(`${label}: Daily quota exhausted, skipping retries`);
        throw error;
      }

      // Parse retry delay from error if available, otherwise use exponential backoff.
      // Serverless functions can't afford long sleeps: if Gemini asks for more
      // than a few seconds, give up now so callers move to their fallbacks.
      const retryMatch = error.message?.match(/retry in ([\d.]+)s/i);
      const suggested = retryMatch ? parseFloat(retryMatch[1]) : Math.pow(2, attempt + 1);
      if (suggested > 5) {
        console.warn(`${label}: Rate limited with ${suggested}s backoff, too long — skipping retries`);
        throw error;
      }
      const delaySeconds = suggested;

      console.log(`${label}: Rate limited, retrying in ${delaySeconds}s (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise((r) => setTimeout(r, delaySeconds * 1000));
    }
  }
}

module.exports = { withGeminiRetry };
