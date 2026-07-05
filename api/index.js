require("dotenv").config();

// Vercel's Node runtime invokes functions with plain (req, res), so the
// Express app is the handler — no Lambda-style wrapper needed.
module.exports = require("../server/src/app");
