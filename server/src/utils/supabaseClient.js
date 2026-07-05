const { createClient } = require("@supabase/supabase-js");

// How long a single Supabase request may take before we abort it.
// Serverless functions cap at 10s; a paused/unreachable project must
// fail fast so callers can fall back instead of timing out the function.
const REQUEST_TIMEOUT_MS = 4000;

const fetchWithTimeout = (url, options = {}) =>
  fetch(url, {
    ...options,
    signal: options.signal || AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

/**
 * Shared Supabase client factory. Returns null when the env vars are
 * absent so callers can branch to their in-memory/fallback paths.
 */
const getSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: fetchWithTimeout },
  });
};

module.exports = { getSupabase };
