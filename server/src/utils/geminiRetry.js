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

      // Parse retry delay from error if available, otherwise use exponential backoff
      const retryMatch = error.message?.match(/retry in ([\d.]+)s/i);
      const delaySeconds = retryMatch
        ? Math.min(parseFloat(retryMatch[1]), 30)
        : Math.pow(2, attempt + 1);

      console.log(`${label}: Rate limited, retrying in ${delaySeconds}s (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise((r) => setTimeout(r, delaySeconds * 1000));
    }
  }
}

module.exports = { withGeminiRetry };
