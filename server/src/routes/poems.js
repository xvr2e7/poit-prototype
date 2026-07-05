const express = require("express");
const { optionalAuth, requireAuth } = require("../middleware/auth");
const deviceService = require("../services/deviceService");
const { getSupabase } = require("../utils/supabaseClient");

const router = express.Router();

// Register / authenticate device
router.post("/auth", async (req, res) => {
  try {
    const { fingerprint } = req.body;
    if (!fingerprint) {
      return res.status(400).json({ error: "fingerprint is required" });
    }

    const result = await deviceService.registerOrGet(fingerprint);
    return res.json(result);
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ error: "Authentication failed" });
  }
});

// Save a poem
router.post("/", requireAuth, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ error: "Database unavailable" });
    }

    const { title, components, selectedWords, dateKey, isPublic = true } = req.body;

    if (!title || !components) {
      return res.status(400).json({ error: "title and components are required" });
    }

    const { data, error } = await supabase
      .from("poems")
      .insert({
        device_id: req.deviceId,
        title,
        components,
        selected_words: selectedWords || [],
        date_key: dateKey || new Date().toISOString().slice(0, 10),
        is_public: isPublic,
        like_count: 0,
      })
      .select("id,title,created_at")
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error) {
    console.error("Save poem error:", error);
    return res.status(500).json({ error: "Failed to save poem" });
  }
});

// Get community poems for Echo mode
router.get("/community", optionalAuth, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.json({ poems: [] });
    }

    const { date_key, limit = 20 } = req.query;

    let query = supabase
      .from("poems")
      .select("id,device_id,title,components,selected_words,date_key,like_count,created_at")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(Math.min(parseInt(limit) || 20, 50));

    if (date_key) {
      query = query.eq("date_key", date_key);
    }

    const { data, error } = await query;

    if (error) throw error;

    const poems = (data || []).map((poem) => ({
      id: poem.id,
      title: poem.title,
      components: poem.components,
      selectedWords: poem.selected_words,
      dateKey: poem.date_key,
      likeCount: poem.like_count,
      createdAt: poem.created_at,
      isOwn: req.deviceId === poem.device_id,
      source: "community",
    }));

    return res.json({ poems });
  } catch (error) {
    console.error("Community poems error:", error);
    return res.json({ poems: [] });
  }
});

// Get a specific poem (for shareable links)
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ error: "Database unavailable" });
    }

    const { data, error } = await supabase
      .from("poems")
      .select("id,device_id,title,components,selected_words,date_key,like_count,is_public,created_at")
      .eq("id", req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Poem not found" });
    }

    // Only return public poems or the user's own
    if (!data.is_public && req.deviceId !== data.device_id) {
      return res.status(404).json({ error: "Poem not found" });
    }

    return res.json({
      id: data.id,
      title: data.title,
      components: data.components,
      selectedWords: data.selected_words,
      dateKey: data.date_key,
      likeCount: data.like_count,
      createdAt: data.created_at,
      isOwn: req.deviceId === data.device_id,
    });
  } catch (error) {
    console.error("Get poem error:", error);
    return res.status(500).json({ error: "Failed to load poem" });
  }
});

// Like a poem
router.post("/:id/like", requireAuth, async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ error: "Database unavailable" });
    }

    // Check if already liked
    const { data: existing } = await supabase
      .from("poem_likes")
      .select("id")
      .eq("poem_id", req.params.id)
      .eq("device_id", req.deviceId)
      .maybeSingle();

    if (existing) {
      // Unlike
      await supabase
        .from("poem_likes")
        .delete()
        .eq("poem_id", req.params.id)
        .eq("device_id", req.deviceId);

      // Decrement count
      await supabase.rpc("decrement_like_count", { poem_id_input: req.params.id });

      return res.json({ liked: false });
    }

    // Like
    const { error } = await supabase.from("poem_likes").insert({
      poem_id: req.params.id,
      device_id: req.deviceId,
    });

    if (error) throw error;

    // Increment count
    await supabase.rpc("increment_like_count", { poem_id_input: req.params.id });

    return res.json({ liked: true });
  } catch (error) {
    console.error("Like error:", error);
    return res.status(500).json({ error: "Failed to toggle like" });
  }
});

module.exports = router;
