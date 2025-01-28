export const TEST_POEMS = [
  {
    id: "poem1",
    title: "Ars Poetica with a Broken Keystroke",
    author: "OV",
    date: "2024-01-28",
    content: [
      [
        "The microwave's hum—your voice grumpy",
        "with sleep—sneaker half-off, slouching",
        "into a question. Fidget, you said, fidget",
        "until the pixels of your name upload",
      ],
      [
        "to skin. Toast glitches crispy shadows",
        "where your face buffered. Crumple the deadline",
        "smaller, smaller—fit it to a boy's sticky fist",
        "awkward as a squeaky doorknob",
      ],
      [
        "still turning. Night sprints through the yard.",
        "Restless, the inbox fills with moths—",
        "their wings a breath unclicked.",
      ],
    ],
  },
  {
    id: "poem2",
    title: "(after the microwave's hymn)",
    author: "EEC",
    date: "2024-01-27",
    content: [
      [
        "*a microwave hums(grumpy)into coffee's",
        "restless O",
        "sneaker-sprints a sticky glitch",
        "(through the pixel's yawn)",
        "a doorknob squeaks its",
        "awkward hymn (slouching toward",
        "       the almost-moon)",
      ],
      [
        "deadline crumples : a crispy",
        "whisper (un)uploaded",
        "buffering buffering",
        "the inbox breathes",
        "      in fidgets",
      ],
      ["o mother of", "unclicked", "light—", "you, you", "(you)"],
    ],
  },
  {
    id: "poem3",
    title: "Upon a Realm of Restless, Clamorous Hours",
    author: "WS",
    date: "2024-01-26",
    content: [
      [
        "O restless inbox, ever-burdened tray,",
        "Where fidgeting thoughts in microwaves do spin,",
        "As deadlines sprint, and pixels fade away,",
        "Thy grumpy hum, by buffering chagrin.",
      ],
      [
        "The sneaker treads where sticky floors persist,",
        "A squeaky doorknob mocks with awkward jest,",
        "Thy coffee cold, once crispy warmth dismissed,",
        "Doth slouch in mugs, a shadow of its zest.",
      ],
      [
        "Beware the glitch that crumples mortal schemes,",
        "When uploads stall and hours lose their might,",
        "Thou, haunted by these flickering screen-gleams,",
        "Art but a ghost in dread's unyielding night.",
      ],
      [
        "Yet soft! What light through yonder window breaks?",
        "'Tis time, not bytes, the soul's true ransom takes.",
      ],
    ],
  },
  {
    id: "poem4",
    title: "The Microwave's Mournful Hymn",
    author: "FP",
    date: "2024-01-25",
    content: [
      [
        "The microwave hums a psalm of elsewhere,",
        "its grumpy light watching time crumple.",
        "I fidget with deadlines—sneakers sprinting",
        "through buffering voids, restless, undone.",
      ],
      [
        "Coffee, once crispy, now a sticky stain,",
        "the squeaky doorknob slouches, glitching ajar.",
        "I upload my soul in pixeled fragments,",
        "an awkward prayer to a flickering star.",
      ],
      [
        "What is the self but a draft unsent,",
        "a crumpled thought in the inbox of night?",
        "The screen's cold glow, a slouching testament—",
        "all shadows, no shape. All glitch, no light.",
      ],
    ],
  },
];

// find shared words between poems
export const findSharedWords = (poem1, poem2) => {
  return poem1.linkedWords.filter((word) => poem2.linkedWords.includes(word));
};

// calculate connection strength between poems
export const calculateConnectionStrength = (poem1, poem2) => {
  const sharedWords = findSharedWords(poem1, poem2);
  return {
    count: sharedWords.length,
    words: sharedWords,
    // Normalize strength between 0 and 1
    strength:
      sharedWords.length /
      Math.min(poem1.linkedWords.length, poem2.linkedWords.length),
  };
};
