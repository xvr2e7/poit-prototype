const test = require("node:test");
const assert = require("node:assert/strict");
const dictionaryService = require("../src/services/dictionaryService");
const curator = require("../src/services/poeticWordCurator");
const wordService = require("../src/services/wordService");
const { rejectReason } = require("../src/services/wordFilter");

const random = ["kidnapping", "harbor", "waivers", "lantern", "ammo"].map((text) => ({
  text, type: "noun", score: 800, source: "wordnik_random",
}));

function stub(t, curated) {
  t.mock.method(dictionaryService, "getWordOfDay", async () => ({ text: "anosmia", type: "noun", score: 1000, source: "wordnik_wotd" }));
  t.mock.method(dictionaryService, "getRecentWotds", async () => []);
  t.mock.method(dictionaryService, "getRandomWords", async () => random);
  t.mock.method(curator, "curateWords", async () => curated);
}

test("when curation is down, no raw random word ships", async (t) => {
  stub(t, null);
  const words = await wordService.getWords();
  assert.equal(words.length, 50);
  assert.equal(new Set(words.map((w) => w.text)).size, 50, "no duplicates");
  assert.ok(!words.some((w) => w.source === "wordnik_random"), "random words withheld");
  for (const w of words) assert.equal(rejectReason(w.text), null, w.text);
});

test("only words the model approved join the pool", async (t) => {
  stub(t, [{ ...random[1], poeticScore: 8 }]);
  const texts = (await wordService.getWords()).map((w) => w.text);
  assert.ok(texts.includes("harbor"));
  for (const w of ["kidnapping", "waivers", "ammo", "lantern"]) {
    if (w === "lantern") continue; // also in the lexicon, may arrive from there
    assert.ok(!texts.includes(w), w);
  }
});
