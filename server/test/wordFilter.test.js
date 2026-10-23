const test = require("node:test");
const assert = require("node:assert/strict");
const { rejectReason } = require("../src/services/wordFilter");
const lexicon = require("../src/data/poeticWords.json");

test("names and acronyms are rejected by their capitals", () => {
  for (const w of ["Kyrgyz", "Apache", "Tony", "Albania", "Welshman", "DSC", "MST", "Liver"]) {
    assert.match(rejectReason(w), /capitalised/, w);
  }
});

test("fragments, clippings and non-words are rejected", () => {
  for (const w of ["dsc", "mst", "pkg", "on-campus", "o'clock", "b2b", "café", "sec", "misc", "ness", "zz", "aaah"]) {
    assert.ok(rejectReason(w), w);
  }
});

test("blocked roots are rejected in their inflections", () => {
  for (const w of [
    "kidnapping", "kidnapped", "kidnapper", "ammo", "arson", "murders", "killed", "stabbed", "guns",
    "invasion", "raped", "overdose", "landfills", "marketers", "upgrades", "hyperlink", "resell",
    "canisters", "downtime", "cancers", "smuggling",
  ]) {
    assert.match(rejectReason(w) ?? "", /^blocked/, w);
  }
});

test("innocent neighbours of blocked roots survive", () => {
  for (const w of [
    "laundry", "telegram", "skill", "warm", "spiced", "spices", "robed", "assemble", "scrape",
    "grape", "drape", "shoots", "crimson", "method", "sextant", "cocoon", "raccoon", "bombastic",
    "stable", "pushing", "begun", "therapist", "drugstore",
  ]) {
    assert.equal(rejectReason(w), null, w);
  }
});

test("every lexicon word passes the gate", () => {
  for (const [pos, words] of Object.entries(lexicon)) {
    for (const w of words) assert.equal(rejectReason(w), null, `${pos}: ${w}`);
  }
});
