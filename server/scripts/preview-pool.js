// Dry run: build one day's word pool the way GET /api/words does, and
// print it. Reads Wordnik and the language model only; nothing is stored.
//
//   node scripts/preview-pool.js            # the real pipeline
//   node scripts/preview-pool.js --no-llm   # as if both model providers were down
//   node scripts/preview-pool.js --json     # the pool as JSON, for fixtures
require("dotenv").config({ path: process.env.DOTENV_PATH || require("path").join(__dirname, "..", ".env") });

if (process.argv.includes("--no-llm")) {
  delete process.env.GEMINI_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
}

const wordService = require("../src/services/wordService");
const dictionaryService = require("../src/services/dictionaryService");

(async () => {
  const words = await wordService.getWords();
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(words));
    return;
  }
  const bySource = {};
  for (const w of words) bySource[w.source] = (bySource[w.source] || 0) + 1;
  console.log(`\n${words.length} words`, bySource);
  console.log(words.map((w) => w.text).join("  "));
  const rejected = dictionaryService.rejected;
  if (rejected.length) {
    console.log(`\nturned away before curation (${rejected.length}):`);
    console.log(rejected.map((r) => `${r.word} (${r.reason})`).join(", "));
  }
})();
