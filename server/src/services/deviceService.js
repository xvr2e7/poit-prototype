const jwt = require("jsonwebtoken");
const { getSupabase } = require("../utils/supabaseClient");

const JWT_SECRET = process.env.JWT_SECRET || "poit-device-secret-change-in-prod";

class DeviceService {
  constructor() {
    this.supabase = getSupabase();
  }

  async registerOrGet(fingerprint) {
    if (!fingerprint) throw new Error("Device fingerprint required");

    if (!this.supabase) {
      // Without Supabase, just issue a JWT with the fingerprint as ID
      const token = this.issueToken(fingerprint, fingerprint);
      return { deviceId: fingerprint, token, isNew: true };
    }

    try {
      return await this.registerOrGetWithSupabase(fingerprint);
    } catch (error) {
      // Supabase unreachable or table missing — degrade to fingerprint identity
      // so the app keeps working without device persistence.
      console.warn(
        `Device registration fell back to fingerprint identity: ${error.message}`
      );
      const token = this.issueToken(fingerprint, fingerprint);
      return { deviceId: fingerprint, token, isNew: true };
    }
  }

  async registerOrGetWithSupabase(fingerprint) {
    // Check if device exists
    const { data: existing } = await this.supabase
      .from("devices")
      .select("id,display_name")
      .eq("device_fingerprint", fingerprint)
      .maybeSingle();

    if (existing) {
      // Update last_seen
      await this.supabase
        .from("devices")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", existing.id);

      const token = this.issueToken(existing.id, fingerprint);
      return { deviceId: existing.id, displayName: existing.display_name, token, isNew: false };
    }

    // Create new device (use upsert to handle race conditions with duplicate fingerprints)
    const { data: newDevice, error } = await this.supabase
      .from("devices")
      .upsert(
        {
          device_fingerprint: fingerprint,
          display_name: "Anonymous Poet",
        },
        { onConflict: "device_fingerprint", ignoreDuplicates: true }
      )
      .select("id,display_name")
      .single();

    // If upsert returned no row (duplicate ignored), fetch the existing one
    if (error || !newDevice) {
      const { data: retried } = await this.supabase
        .from("devices")
        .select("id,display_name")
        .eq("device_fingerprint", fingerprint)
        .single();

      if (retried) {
        const token = this.issueToken(retried.id, fingerprint);
        return { deviceId: retried.id, displayName: retried.display_name, token, isNew: false };
      }

      throw new Error(`Failed to register device: ${error?.message || "unknown error"}`);
    }

    const token = this.issueToken(newDevice.id, fingerprint);
    return { deviceId: newDevice.id, displayName: newDevice.display_name, token, isNew: true };
  }

  issueToken(deviceId, fingerprint) {
    return jwt.sign({ deviceId, fingerprint }, JWT_SECRET, {
      expiresIn: "365d",
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  }
}

module.exports = new DeviceService();
