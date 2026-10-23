// Words that never belong in a shared daily pool. Entries are base forms;
// wordFilter also blocks their regular inflections (kidnap → kidnapped,
// kidnapping, kidnapper), so list each root once. Keep roots specific: a
// broad one like "war" or "shoot" would block warmth and spring shoots.
// Slurs, profanity and fragments match exactly (plus plural) because short
// roots inflect into innocent words.

const violence = [
  "abduct", "abduction", "abuse", "abuser", "airstrike", "ammo", "ammunition", "arsenal", "artillery", "assassin",
  "assassinate", "assassination", "assault", "atrocity", "behead", "beheading", "bloodshed", "bomb",
  "bomber", "bombard", "bombardment", "brutality", "butcher", "carnage", "combat", "decapitate",
  "dismember", "electrocute", "execution", "executioner", "explosive", "firearm", "genocide",
  "grenade", "gun", "gunfire", "gunman", "gunpoint", "gunshot", "handgun", "hijack", "homicide",
  "hostage", "insurgency", "insurgent", "invade", "invader", "invasion", "kidnap", "kidnapper",
  "kill", "killer", "lynch", "maim", "manslaughter", "massacre", "militia", "missile", "murder", "murderer", "mutilate",
  "pistol", "rifle", "shooter", "shooting", "shotgun", "shrapnel", "slaughter", "slay", "sniper",
  "stab", "stabbing", "strangle", "suffocate", "terror", "terrorism", "terrorist", "torture",
  "violence", "violent", "warfare", "weapon", "weaponry",
];

const crime = [
  "accomplice", "arson", "arsonist", "bribe", "bribery", "burglar", "burglary", "carjack", "cartel",
  "crime", "criminal", "embezzle", "embezzlement", "extort", "extortion", "felon", "felony",
  "fraud", "fraudster", "gangster", "indictment", "looter", "looting", "mobster", "mugger",
  "mugging", "perpetrator", "racketeer", "ransom", "robber", "robbery", "shoplift", "smuggle",
  "smuggler", "stalker", "theft", "trafficker", "trafficking", "vandal", "vandalism",
];

const disaster = [
  "autopsy", "cadaver", "carcass", "casualty", "catastrophe", "corpse", "disaster", "epidemic",
  "euthanasia", "evacuation", "explosion", "famine", "fatality", "holocaust", "meltdown", "morgue",
  "overdose", "pandemic", "suicidal", "suicide", "tsunami", "wreckage",
];

const sexual = [
  "brothel", "clitoris", "condom", "ejaculate", "erection", "erotic", "erotica", "fetish",
  "genital", "genitalia", "harass", "harassment", "hooker", "horny", "incest", "kinky", "lewd",
  "masturbate", "molest", "molester", "nipple", "nude", "orgasm", "orgy", "paedophile", "pedophile",
  "penis", "porn", "porno", "pornography", "prostitute", "prostitution", "rape", "rapist",
  "scrotum", "sex", "sexual", "sexuality", "sexy", "slut", "stripper", "testicle", "vagina", "whore",
];

const drugs = [
  "cannabis", "cocaine", "crackhead", "drug", "heroin", "junkie", "marijuana", "meth",
  "methamphetamine", "narcotic", "opioid", "opium", "stoner",
];

const profanityAndSlurs = [
  "asshole", "bastard", "bimbo", "bitch", "bollocks", "chink", "coon", "crap", "cunt", "dick",
  "dyke", "fag", "faggot", "fascist", "fuck", "gook", "jihad", "jihadist", "kike", "nazi",
  "nigga", "nigger", "piss", "racism", "racist", "retard", "retarded", "shit", "skank", "spic",
  "tranny", "twat", "wanker", "wetback",
];

const clinical = [
  "asthma", "biopsy", "cancer", "carcinoma", "catheter", "chemotherapy", "chlamydia", "colonoscopy",
  "dementia", "diabetes", "diarrhea", "diarrhoea", "disease", "disorder", "dysentery", "enema",
  "excrement", "feces", "gonorrhea", "hemorrhoid", "herpes", "infection", "laxative", "mucus",
  "phlegm", "pus", "sewage", "syndrome", "syphilis", "tumor", "tumour", "urine", "vomit",
];

// Commerce, tech, admin, law and sport: words with no image in them.
const jargon = [
  "accountant", "accounting", "advertiser", "advertising", "affidavit", "algorithm", "amortize",
  "app", "arbitrage", "audit", "auditor", "backend", "bandwidth", "benchmark", "binary", "boolean",
  "browser", "budget", "bureaucracy", "bureaucrat", "canister", "capitalize", "collateral", "commercial",
  "compile", "compiler", "compliance", "consultancy", "consultant", "coupon", "database",
  "debug", "defendant", "depreciate", "dialog", "discount", "dividend", "download", "downsize",
  "downtime", "email", "ethernet", "firmware", "franchise", "frontend", "hardware", "hyperlink",
  "incentivize", "insurance", "integer", "inventory", "invoice", "landfill", "layup", "leverage",
  "liability", "liquidate", "litigation", "logistics", "login", "logout", "malloc", "markup", "marketer",
  "marketing", "memo", "merchandise", "middleware", "monetize", "mortgage", "offline", "onboarding",
  "online", "optimization", "optimize", "outsource", "password", "paperwork", "pascal", "payroll",
  "pixel", "plaintiff", "playoff", "proactive", "procurement", "quarterback", "rebate", "rebrand",
  "refinance", "regulation", "regulatory", "resell", "reseller", "retail", "retailer", "revenue",
  "runtime", "scalable", "server", "shareholder", "shipment", "software", "spreadsheet",
  "stakeholder", "startup", "statute", "streamline", "stylesheet", "subpoena", "subsidiary",
  "synergy", "syntax", "taxation", "telemarketer", "throughput", "touchdown", "upgrade", "upload",
  "upscale", "username", "voucher", "waiver", "warranty", "webpage", "website", "wholesale",
  "wholesaler", "workflow",
];

// Clippings and fragments that carry a dictionary entry but read as noise.
const fragments = [
  "approx", "dept", "etc", "govt", "info", "intro", "ish", "ism", "misc", "ness", "ology", "sec",
];

module.exports = {
  inflected: { violence, crime, disaster, sexual, drugs, clinical, jargon },
  exact: { profanityAndSlurs, fragments },
};
