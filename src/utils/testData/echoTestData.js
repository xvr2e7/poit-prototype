// Create a word object with position
const createWord = (text, x, y, scale = 1, type = "word") => ({
  id: `${type}-${text}-${Math.random().toString(36).substr(2, 9)}`,
  text,
  type, // 'word' or 'punctuation'
  position: { x, y },
  scale,
});

// Split text into words, preserving hyphenated words and separating punctuation
const tokenize = (text) => {
  const tokens = [];
  let currentWord = "";
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    // Check for hyphenated words (keeping the hyphen)
    if (
      char === "-" &&
      i > 0 &&
      i < text.length - 1 &&
      /[a-zA-Z]/.test(text[i - 1]) &&
      /[a-zA-Z]/.test(text[i + 1])
    ) {
      currentWord += char;
    }
    // Handle punctuation (except hyphens in words)
    else if (/[^a-zA-Z\s]/.test(char)) {
      // If we have a word in progress, add it first
      if (currentWord.trim()) {
        tokens.push({ text: currentWord.trim(), type: "word" });
        currentWord = "";
      }
      // Add the punctuation as its own token
      tokens.push({ text: char, type: "punctuation" });
    }
    // Handle spaces
    else if (/\s/.test(char)) {
      if (currentWord.trim()) {
        tokens.push({ text: currentWord.trim(), type: "word" });
        currentWord = "";
      }
    }
    // Build word
    else {
      currentWord += char;
    }
    i++;
  }

  // Add any remaining word
  if (currentWord.trim()) {
    tokens.push({ text: currentWord.trim(), type: "word" });
  }

  return tokens;
};

// Convert a poem's content into spatially arranged words
const arrangeWords = (content) => {
  let components = [];
  const baseX = 100;
  const baseY = 100;
  const wordSpacing = 100;
  const punctuationSpacing = 50; // New spacing for punctuation
  const lineSpacing = 60; // Increased from 60
  const stanzaSpacing = 80; // Increased from 40

  let currentX = baseX;
  let currentY = baseY;

  content.forEach((stanza, stanzaIndex) => {
    // Reset x position for new stanza
    currentX = baseX;
    if (stanzaIndex > 0) {
      currentY += stanzaSpacing;
    }

    stanza.forEach((line) => {
      const tokens = tokenize(line);

      tokens.forEach((token) => {
        // Add slight randomness to positions for natural feel
        const randomX = Math.random() * 10 - 5;
        const randomY = Math.random() * 6 - 3;

        // Calculate spacing based on token type
        const spacing =
          token.type === "punctuation" ? punctuationSpacing : wordSpacing;

        components.push(
          createWord(
            token.text,
            currentX + randomX,
            currentY + randomY,
            token.type === "punctuation" ? 0.8 : 1,
            token.type
          )
        );

        currentX += spacing;
      });

      // Move to next line
      currentX = baseX;
      currentY += lineSpacing;
    });
  });

  return components;
};
export const TEST_POEMS = [
  {
    id: "poem1",
    title: "Ars Poetica with a Broken Keystroke",
    author: "OV",
    date: "2024-01-28",
    originalContent: [
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
    words: [], // Will be populated in initialization
    metadata: {
      totalWords: 0,
      highlightedWordCount: 0,
    },
  },
  {
    id: "poem2",
    title: "(after the microwave's hymn)",
    author: "EEC",
    date: "2024-01-27",
    originalContent: [
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
    words: [], // Will be populated in initialization
    metadata: {
      totalWords: 0,
      highlightedWordCount: 0,
    },
  },
  {
    id: "poem3",
    title: "Upon a Realm of Restless, Clamorous Hours",
    author: "WS",
    date: "2024-01-26",
    originalContent: [
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
    words: [], // Will be populated in initialization
    metadata: {
      totalWords: 0,
      highlightedWordCount: 0,
    },
  },
  {
    id: "poem4",
    title: "The Microwave's Mournful Hymn",
    author: "FP",
    date: "2024-01-25",
    originalContent: [
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
    words: [], // Will be populated in initialization
    metadata: {
      totalWords: 0,
      highlightedWordCount: 0,
    },
  },
];

// Initialize components for each poem
TEST_POEMS.forEach((poem) => {
  poem.components = arrangeWords(poem.originalContent);
  poem.metadata.totalComponents = poem.components.length;
  // We'll set highlightedWordCount when we process against the word pool
});

// Check if a word matches test word, ignoring case and handling hyphenation
export const doesWordMatch = (wordText, testWord) => {
  const normalizedWord = wordText.toLowerCase();
  const normalizedTest = testWord.toLowerCase();

  // Direct match
  if (normalizedWord === normalizedTest) return true;

  // Check if it's part of a hyphenated word
  if (normalizedWord.includes("-")) {
    const parts = normalizedWord.split("-");
    return parts.includes(normalizedTest);
  }

  return false;
};

// Find shared words between poems
export const findSharedWords = (poem1, poem2) => {
  const getWordComponents = (poem) =>
    poem.components
      .filter((c) => c.type === "word")
      .map((w) => w.text.toLowerCase());

  const words1 = new Set(getWordComponents(poem1));
  const words2 = new Set(getWordComponents(poem2));
  return [...words1].filter((word) => words2.has(word));
};

// Verify if a component was from the original word pool
export const isHighlightedWord = (component, wordPool) => {
  if (component.type !== "word") return false;
  return wordPool.some((poolWord) =>
    doesWordMatch(component.text, poolWord.text)
  );
};
