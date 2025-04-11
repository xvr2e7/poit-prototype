import wordData from "./wordData.json";
import poemData from "./poemData.json";

// Function to create a word object with position
const createWord = (text, x, y, scale = 1, type = "word") => ({
  id: `${type}-${text}-${Math.random().toString(36).substr(2, 9)}`,
  text,
  type, // 'word' or 'punctuation'
  position: { x, y },
  scale,
});

// Split text into words and punctuation
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

// Extract bold words from markdown text
const extractBoldWords = (content) => {
  const boldWords = [];
  const boldPattern = /\*\*([^*]+)\*\*/g;

  // Process the content string to find bold words
  const contentString =
    typeof content === "string"
      ? content
      : Array.isArray(content)
      ? content.join("\n")
      : "";

  let match;
  while ((match = boldPattern.exec(contentString)) !== null) {
    boldWords.push(match[1].toLowerCase());
  }

  return boldWords;
};

// Get words that are in both the poem content and the test word pool
const getSharedWords = (poem, wordPool) => {
  const poemContent =
    typeof poem.content === "string"
      ? poem.content
      : Array.isArray(poem.content)
      ? poem.content.join("\n")
      : "";

  // Clean the poem content (remove bold markers, punctuation)
  const cleanContent = poemContent
    .replace(/\*\*/g, "") // Remove bold markers
    .replace(/[^\w\s-]/g, " ") // Replace punctuation with spaces
    .toLowerCase();

  // Split into words
  const poemWords = cleanContent
    .split(/\s+/)
    .filter((word) => word.trim().length > 0);

  // Get the word pool texts
  const wordPoolTexts = wordPool.map((w) =>
    typeof w === "string" ? w.toLowerCase() : w.text.toLowerCase()
  );

  // Find shared words
  return poemWords.filter((word) => wordPoolTexts.includes(word));
};

// Convert poem content from markdown to spatially arranged components
const arrangeWords = (content, wordPool) => {
  let components = [];
  const baseX = 100;
  const baseY = 100;
  const wordSpacing = 100;
  const punctuationSpacing = 50;
  const lineSpacing = 60;
  const stanzaSpacing = 80;

  // Extract wordPool texts for comparison
  const wordPoolTexts = wordPool.map((w) =>
    typeof w === "string" ? w.toLowerCase() : w.text.toLowerCase()
  );

  // Extract bold words from content for highlighting
  const boldWords = extractBoldWords(content);

  let currentX = baseX;
  let currentY = baseY;

  // Split content into lines
  const lines = content.split("\n");
  let stanzaIndex = 0;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    // Reset x position for new line
    currentX = baseX;

    // Check if this is an empty line (stanza break)
    if (line.trim() === "") {
      currentY += stanzaSpacing;
      stanzaIndex++;
      continue;
    }

    // Remove bold markers for processing
    const cleanLine = line.replace(/\*\*/g, "");

    // Split into words and punctuation
    const tokens = tokenize(cleanLine);

    // Create positioned components for this line
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
  }

  // Count how many words are in the word pool
  // A word is considered "highlighted" if it's in the word pool OR it was bold in the original content
  const highlightedWordCount = components.filter(
    (c) =>
      c.type === "word" &&
      (wordPoolTexts.includes(c.text.toLowerCase()) ||
        boldWords.includes(c.text.toLowerCase()))
  ).length;

  return { components, highlightedWordCount };
};

// Convert poem data to the format expected by echo mode
const formatPoems = () => {
  // Extract test words for highlighting
  const wordPool = wordData.words.map((w) => w.text);

  // First, process all the poems
  const formattedPoems = poemData.map((poem, index) => {
    // Process poem content to extract components
    const { components, highlightedWordCount } = arrangeWords(
      poem.content,
      wordPool
    );

    // Calculate date (staggered, with most recent first)
    const date = new Date();
    date.setDate(date.getDate() - index);
    const formattedDate = date.toLocaleDateString();

    return {
      id: `poem-${index}`,
      title: poem.title,
      date: formattedDate,
      content: Array.isArray(poem.content)
        ? poem.content
        : poem.content.split("\n"),
      components,
      metadata: {
        totalComponents: components.length,
        highlightedWordCount,
        totalWords: components.filter((c) => c.type === "word").length,
        sharedWords: getSharedWords(poem, wordPool),
      },
    };
  });

  return formattedPoems;
};

// Get test words for pulse mode
export const getTestWords = () => {
  return wordData.words;
};

// Get formatted poems for echo mode
export const getTestPoems = () => {
  return formatPoems();
};

// Check if a word from a poem matches a word in the pool
export const isHighlightedWord = (component, wordPool) => {
  if (component.type !== "word") return false;

  return wordPool.some((poolWord) => {
    const poolText = typeof poolWord === "string" ? poolWord : poolWord.text;
    return poolText.toLowerCase() === component.text.toLowerCase();
  });
};

// Get the test words as an array of strings
export const getTestWordStrings = () => {
  return wordData.words.map((word) => word.text);
};
