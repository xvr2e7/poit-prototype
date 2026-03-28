const { createClient } = require("@supabase/supabase-js");

class DailyWordStore {
  constructor() {
    this.memory = new Map();

    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    this.supabase =
      url && serviceKey
        ? createClient(url, serviceKey, {
            auth: { persistSession: false, autoRefreshToken: false },
          })
        : null;
  }

  getCacheKey(timezone, dateKey) {
    return `${timezone}:${dateKey}`;
  }

  getFromMemory(timezone, dateKey) {
    return this.memory.get(this.getCacheKey(timezone, dateKey)) || null;
  }

  setMemory(timezone, dateKey, payload) {
    this.memory.set(this.getCacheKey(timezone, dateKey), payload);
  }

  async get(timezone, dateKey) {
    const memoryCached = this.getFromMemory(timezone, dateKey);
    if (memoryCached?.words?.length) {
      return memoryCached;
    }

    if (!this.supabase) {
      return null;
    }

    const { data, error } = await this.supabase
      .from("daily_word_sets")
      .select("timezone,date_key,words,refreshed_at")
      .eq("timezone", timezone)
      .eq("date_key", dateKey)
      .maybeSingle();

    if (error) {
      console.error("Supabase read error:", error.message);
      return null;
    }

    if (!data?.words?.length) {
      return null;
    }

    const payload = {
      words: data.words,
      refreshedAt: data.refreshed_at,
      dateKey: data.date_key,
    };

    this.setMemory(timezone, dateKey, payload);
    return payload;
  }

  async upsert(timezone, dateKey, words) {
    const refreshedAt = new Date().toISOString();
    const payload = {
      words,
      refreshedAt,
      dateKey,
    };

    this.setMemory(timezone, dateKey, payload);

    if (!this.supabase) {
      return payload;
    }

    const { data, error } = await this.supabase
      .from("daily_word_sets")
      .upsert(
        {
          timezone,
          date_key: dateKey,
          words,
          refreshed_at: refreshedAt,
        },
        { onConflict: "timezone,date_key" }
      )
      .select("timezone,date_key,words,refreshed_at")
      .single();

    if (error) {
      console.error("Supabase upsert error:", error.message);
      return payload;
    }

    return {
      words: data.words,
      refreshedAt: data.refreshed_at,
      dateKey: data.date_key,
    };
  }
}

module.exports = new DailyWordStore();
