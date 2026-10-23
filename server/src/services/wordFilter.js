// The gate every word passes before it can reach a poet's pool.
//
// rejectReason() takes the word exactly as the source spelled it. Case
// carries meaning here: Wordnik returns proper nouns and acronyms
// capitalised ("Kyrgyz", "Apache", "DSC"), so a capital anywhere means the
// word is a name or an abbreviation, not a common word. (The old filter
// lowercased first and then looked for capitals, so it never caught one.)

const { inflected, exact } = require("../data/blockedWords");

const VOWEL = /[aeiouy]/;

/** Regular inflections of a base form: plural/3sg, past, -ing, agent, -ly. */
function inflect(base) {
  const forms = new Set([base]);
  const add = (...ws) => ws.forEach((w) => forms.add(w));
  const consonantY = /[^aeiou]y$/.test(base);
  // Monosyllabic consonant-vowel-consonant roots double (stab → stabbed);
  // longer ones may or may not (kidnapped, kidnaped), so allow both.
  const cvc = /[^aeiou][aeiou][^aeiouwxy]$/.test(base);
  const oneSyllable = (base.match(/[aeiouy]+/g) || []).length === 1;
  const doubled = cvc ? base + base.at(-1) : null;

  if (/(s|x|z|ch|sh)$/.test(base)) add(base + "es");
  else if (consonantY) add(base.slice(0, -1) + "ies");
  else if (/o$/.test(base)) add(base + "s", base + "es");
  else add(base + "s");

  for (const suffix of ["ed", "ing", "er", "ers", "ings"]) {
    if (suffix !== "ing" && suffix !== "ings" && base.endsWith("e")) add(base + suffix.slice(1));
    else if (suffix.startsWith("ing") && /ie$/.test(base)) add(base.slice(0, -2) + "y" + suffix);
    else if (suffix.startsWith("ing") && /[^e]e$/.test(base)) add(base.slice(0, -1) + suffix);
    else if (consonantY && suffix !== "ing" && suffix !== "ings") add(base.slice(0, -1) + "i" + suffix);
    else if (doubled && oneSyllable) add(doubled + suffix);
    else if (doubled) add(doubled + suffix, base + suffix);
    else add(base + suffix);
  }
  add(base + "ly");
  return forms;
}

function plural(base) {
  return new Set([base, /(s|x|z|ch|sh)$/.test(base) ? base + "es" : base + "s"]);
}

const BLOCKED = new Map(); // form → category
for (const [category, bases] of Object.entries(inflected)) {
  for (const base of bases) for (const form of inflect(base)) if (!BLOCKED.has(form)) BLOCKED.set(form, category);
}
for (const [category, bases] of Object.entries(exact)) {
  for (const base of bases) for (const form of plural(base)) if (!BLOCKED.has(form)) BLOCKED.set(form, category);
}

/**
 * Why a word can't join the pool, or null if it can.
 * @param {string} raw the word as the source spelled it
 */
function rejectReason(raw) {
  if (typeof raw !== "string" || !raw) return "empty";
  if (/[A-Z]/.test(raw)) return "capitalised: a name or an acronym";
  if (!/^[a-z]+$/.test(raw)) return "not a plain word (hyphen, apostrophe, digit or accent)";
  if (raw.length < 3 || raw.length > 14) return "too short or too long";
  if (!VOWEL.test(raw)) return "no vowel: an abbreviation";
  if (/(.)\1\1/.test(raw)) return "a letter three times running";
  const category = BLOCKED.get(raw);
  if (category) return `blocked: ${category}`;
  return null;
}

const isAcceptable = (raw) => rejectReason(raw) === null;

module.exports = { rejectReason, isAcceptable, inflect };
