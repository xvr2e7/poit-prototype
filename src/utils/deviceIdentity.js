/**
 * Client-side anonymous device identity for POiT.
 * Generates a stable fingerprint, manages JWT auth, and provides
 * an authenticated fetch wrapper.
 */

import { API_URL } from "./api";

const STORAGE_KEY = "poit_device_token";
const DEVICE_ID_KEY = "poit_device_id";

let cachedToken = null;
let cachedDeviceId = null;

/**
 * Generate a stable-ish device fingerprint from browser properties.
 * Not meant to be cryptographically strong – just unique enough
 * for anonymous identity.
 */
function generateFingerprint() {
  const parts = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || "unknown",
  ];
  const raw = parts.join("|");
  // Simple hash (djb2)
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash + raw.charCodeAt(i)) >>> 0;
  }
  return "fp-" + hash.toString(36);
}

/**
 * Initialise device identity — registers with the server and stores JWT.
 * Returns { deviceId, token } or null on failure.
 */
export async function initDeviceIdentity() {
  // Return cached values if available
  const storedToken = localStorage.getItem(STORAGE_KEY);
  const storedDeviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (storedToken && storedDeviceId) {
    cachedToken = storedToken;
    cachedDeviceId = storedDeviceId;
    return { deviceId: storedDeviceId, token: storedToken };
  }

  try {
    const fingerprint = generateFingerprint();
    const res = await fetch(`${API_URL}/poems/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fingerprint }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    cachedToken = data.token;
    cachedDeviceId = data.deviceId;
    localStorage.setItem(STORAGE_KEY, data.token);
    localStorage.setItem(DEVICE_ID_KEY, data.deviceId);
    return data;
  } catch (err) {
    console.error("Device identity init failed:", err);
    return null;
  }
}

/**
 * Get the current JWT token (or null).
 */
export function getToken() {
  if (cachedToken) return cachedToken;
  cachedToken = localStorage.getItem(STORAGE_KEY);
  return cachedToken;
}

/**
 * Get the current device ID (or null).
 */
export function getDeviceId() {
  if (cachedDeviceId) return cachedDeviceId;
  cachedDeviceId = localStorage.getItem(DEVICE_ID_KEY);
  return cachedDeviceId;
}

/**
 * Authenticated fetch wrapper. Attaches JWT Bearer token to requests.
 */
export async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    return fetch(url, {
      ...options,
      headers,
      body: JSON.stringify(options.body),
    });
  }
  return fetch(url, { ...options, headers });
}
