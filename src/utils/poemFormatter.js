// Shared poem formatting utilities for both test data and seed poems

const createWord = (text, x, y, scale = 1, type = "word") => ({
  id: `${type}-${text}-${Math.random().toString(36).substr(2, 9)}`,
  text,
  type,
  position: { x, y },
  scale,
});

const tokenize = (text) => {
  const tokens = [];
  let currentWord = "";
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (
      char === "-" &&
      i > 0 &&
      i < text.length - 1 &&
      /[a-zA-Z]/.test(text[i - 1]) &&
      /[a-zA-Z]/.test(text[i + 1])
    ) {
      currentWord += char;
    } else if (/[^a-zA-Z\s]/.test(char)) {
      if (currentWord.trim()) {
        tokens.push({ text: currentWord.trim(), type: "word" });
        currentWord = "";
      }
      tokens.push({ text: char, type: "punctuation" });
    } else if (/\s/.test(char)) {
      if (currentWord.trim()) {
        tokens.push({ text: currentWord.trim(), type: "word" });
        currentWord = "";
      }
    } else {
      currentWord += char;
    }
    i++;
  }

  if (currentWord.trim()) {
    tokens.push({ text: currentWord.trim(), type: "word" });
  }

  return tokens;
};

export const extractBoldWords = (content) => {
  const boldWords = [];
  const boldPattern = /\*\*([^*]+)\*\*/g;
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

export const getSharedWords = (poem, wordPool) => {
  const poemContent =
    typeof poem.content === "string"
      ? poem.content
      : Array.isArray(poem.content)
      ? poem.content.join("\n")
      : "";

  const cleanContent = poemContent
    .replace(/\*\*/g, "")
    .replace(/[^\w\s-]/g, " ")
    .toLowerCase();

  const poemWords = cleanContent
    .split(/\s+/)
    .filter((word) => word.trim().length > 0);

  const wordPoolTexts = wordPool.map((w) =>
    typeof w === "string" ? w.toLowerCase() : w.text.toLowerCase()
  );

  return poemWords.filter((word) => wordPoolTexts.includes(word));
};

export const arrangeWords = (content, wordPool) => {
  let components = [];
  const baseX = 100;
  const baseY = 100;
  const wordSpacing = 100;
  const punctuationSpacing = 50;
  const lineSpacing = 60;
  const stanzaSpacing = 80;

  const wordPoolTexts = wordPool.map((w) =>
    typeof w === "string" ? w.toLowerCase() : w.text.toLowerCase()
  );

  const boldWords = extractBoldWords(content);

  let currentX = baseX;
  let currentY = baseY;

  const lines = content.split("\n");

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    currentX = baseX;

    if (line.trim() === "") {
      currentY += stanzaSpacing;
      continue;
    }

    const cleanLine = line.replace(/\*\*/g, "");
    const tokens = tokenize(cleanLine);

    tokens.forEach((token) => {
      const randomX = Math.random() * 10 - 5;
      const randomY = Math.random() * 6 - 3;
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

    currentX = baseX;
    currentY += lineSpacing;
  }

  const highlightedWordCount = components.filter(
    (c) =>
      c.type === "word" &&
      (wordPoolTexts.includes(c.text.toLowerCase()) ||
        boldWords.includes(c.text.toLowerCase()))
  ).length;

  return { components, highlightedWordCount };
};

/**
 * Format a seed poem (from the API) into the structure expected by Echo mode.
 */
export const formatSeedPoem = (poem, wordPool, index = 0) => {
  const poolTexts = wordPool.map((w) =>
    typeof w === "string" ? w : w.text
  );

  const { components, highlightedWordCount } = arrangeWords(
    poem.content,
    poolTexts
  );

  return {
    id: poem.id || `seed-${index}`,
    title: poem.title,
    date: new Date().toLocaleDateString(),
    content: Array.isArray(poem.content)
      ? poem.content
      : poem.content.split("\n"),
    components,
    selectedWords: poolTexts,
    source: poem.source || "seed",
    metadata: {
      totalComponents: components.length,
      highlightedWordCount,
      totalWords: components.filter((c) => c.type === "word").length,
      sharedWords: getSharedWords(poem, poolTexts),
    },
  };
};

/**
 * Format an array of seed poems for Echo mode.
 */
export const formatSeedPoems = (poems, wordPool) => {
  return poems.map((poem, i) => formatSeedPoem(poem, wordPool, i));
};
