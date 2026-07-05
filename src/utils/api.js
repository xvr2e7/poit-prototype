/**
 * Central API base URL for the POiT backend.
 *
 * Defaults to the relative "/api" path, which works in every environment:
 * - dev: Vite proxies /api -> http://localhost:5001 (vite.config.js)
 * - prod: Vercel rewrites /api/* to the serverless function (vercel.json)
 *
 * Set VITE_API_URL only when the API lives on another origin
 * (include the /api suffix, e.g. https://api.example.com/api).
 */
export const API_URL = import.meta.env.VITE_API_URL || "/api";
