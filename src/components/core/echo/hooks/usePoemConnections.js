import { useMemo } from "react";
import { TEST_WORDS } from "../../../../utils/testData/craftTestData";

export const usePoemConnections = (poems = []) => {
  const poemAnalysis = useMemo(() => {
    // Extract test words for matching
    const testWordSet = new Set(TEST_WORDS.map((w) => w.text.toLowerCase()));

    // Analyze each poem for test words
    const poemWordMap = new Map();

    poems.forEach((poem) => {
      if (!poem?.content || !Array.isArray(poem.content)) {
        console.warn("Invalid poem content structure:", poem);
        return;
      }

      const words = new Set();
      try {
        // Safely flatten and process content
        poem.content.forEach((stanza) => {
          if (Array.isArray(stanza)) {
            stanza.forEach((line) => {
              if (typeof line === "string") {
                // Split line into words and clean them
                line
                  .toLowerCase()
                  .replace(/[^a-z\s-]/g, "") // Remove punctuation except hyphens
                  .split(/[\s]+/) // Split on whitespace
                  .forEach((word) => {
                    // Check if word (or parts of hyphenated word) are in test words
                    word.split("-").forEach((part) => {
                      if (testWordSet.has(part)) {
                        words.add(part);
                      }
                    });
                  });
              }
            });
          }
        });
      } catch (error) {
        console.error("Error processing poem content:", error);
      }

      poemWordMap.set(poem.id, Array.from(words));
    });

    // Calculate connections between poems
    const connections = new Map();
    poems.forEach((poem1, i) => {
      poems.slice(i + 1).forEach((poem2) => {
        const words1 = poemWordMap.get(poem1.id);
        const words2 = poemWordMap.get(poem2.id);

        if (!words1 || !words2) return;

        const sharedWords = words1.filter((word) => words2.includes(word));

        if (sharedWords.length > 0) {
          const connectionKey = `${poem1.id}-${poem2.id}`;
          connections.set(connectionKey, {
            poems: [poem1.id, poem2.id],
            sharedWords,
            strength:
              sharedWords.length / Math.min(words1.length, words2.length),
          });
        }
      });
    });

    return {
      poemWords: poemWordMap,
      connections,
      // Helper functions
      getSharedWords: (poem1Id, poem2Id) => {
        if (!poem1Id || !poem2Id) return [];
        const key = [poem1Id, poem2Id].sort().join("-");
        return connections.get(key)?.sharedWords || [];
      },
      getConnectionStrength: (poem1Id, poem2Id) => {
        if (!poem1Id || !poem2Id) return 0;
        const key = [poem1Id, poem2Id].sort().join("-");
        return connections.get(key)?.strength || 0;
      },
      getPoemWords: (poemId) => poemWordMap.get(poemId) || [],
    };
  }, [poems]);

  return poemAnalysis;
};
