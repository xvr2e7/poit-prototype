import { useState, useMemo, useCallback } from "react";

export const usePoemNavigation = (allPoems = [], wordPool = []) => {
  // Initialize state first
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [currentPoemId, setCurrentPoemId] = useState(null);

  // Add state to track the source of navigation
  const [sourceNavigation, setSourceNavigation] = useState({
    poemId: null,
    word: null,
  });

  // Calculate all the poem data and memoize it
  const { frequencies, connections, initialPoemId } = useMemo(() => {
    const freqMap = new Map();
    const connMap = new Map();

    // Initialize with first poem if we have any
    const firstPoemId = allPoems[0]?.id || null;

    // Extract word pool text for easier comparison
    const wordPoolText = wordPool.map((w) =>
      typeof w === "string" ? w.toLowerCase() : w.text.toLowerCase()
    );

    allPoems.forEach((poem) => {
      const poemWords = new Set();

      // Handle components if available
      if (poem.components && Array.isArray(poem.components)) {
        poem.components.forEach((component) => {
          if (component.type === "word") {
            const word = component.text.toLowerCase();
            poemWords.add(word);
            freqMap.set(word, (freqMap.get(word) || 0) + 1);
          }
        });
      }

      // Map poem connections
      allPoems.forEach((otherPoem) => {
        if (poem.id === otherPoem.id) return;

        const sharedWords = [];

        if (otherPoem.components && Array.isArray(otherPoem.components)) {
          otherPoem.components.forEach((component) => {
            if (
              component.type === "word" &&
              poemWords.has(component.text.toLowerCase()) &&
              wordPoolText.includes(component.text.toLowerCase())
            ) {
              sharedWords.push(component.text.toLowerCase());
            }
          });
        }

        if (sharedWords.length > 0) {
          const key = [poem.id, otherPoem.id].sort().join("-");
          const poolWordOverlap = sharedWords.filter((word) =>
            wordPoolText.includes(word)
          ).length;

          connMap.set(key, {
            sharedWords,
            overlapScore: poolWordOverlap,
          });
        }
      });
    });

    return {
      frequencies: freqMap,
      connections: connMap,
      initialPoemId: firstPoemId,
    };
  }, [allPoems, wordPool]);

  // Set initial poem ID after memo calculation
  useMemo(() => {
    if (!currentPoemId && initialPoemId) {
      setCurrentPoemId(initialPoemId);
    }
  }, [initialPoemId, currentPoemId]);

  // Get glow intensity for a word based on its frequency
  const getWordGlowIntensity = useCallback(
    (word) => {
      const frequency = frequencies.get(word.toLowerCase()) || 0;
      // Get the max frequency from the frequencies map, defaulting to 0 if the map is empty
      const maxFrequency = Math.max(...Array.from(frequencies.values()), 0);
      // Return a glow intensity that scales with the word frequency
      return frequency > 1 ? frequency / Math.max(maxFrequency, 1) : 0;
    },
    [frequencies]
  );

  // Find next poem with highest overlap score for a given word
  const findNextPoemForWord = useCallback(
    (word) => {
      if (!currentPoemId) return null;

      // Convert word to lowercase for comparison
      const wordLower =
        typeof word === "string" ? word.toLowerCase() : word.toLowerCase();

      // Get the most recent poem ID from navigation history
      const previousPoemId =
        navigationHistory.length > 0
          ? navigationHistory[navigationHistory.length - 1]
          : null;

      // Check if we'd be going back to the source poem via the same word
      const isBackToSource =
        sourceNavigation.word === wordLower &&
        previousPoemId === sourceNavigation.poemId;

      // Find all poems that contain this word (except current poem)
      const candidatePoems = allPoems.filter((poem) => {
        if (poem.id === currentPoemId) return false;

        return (
          poem.components &&
          poem.components.some(
            (comp) =>
              comp.type === "word" && comp.text.toLowerCase() === wordLower
          )
        );
      });

      // If the only candidate is the source poem and we'd be creating a circular reference,
      // return null to disable the connection
      if (
        candidatePoems.length === 1 &&
        isBackToSource &&
        candidatePoems[0].id === previousPoemId
      ) {
        return null;
      }

      // Filter out the source poem if we'd be creating a circular reference
      const filteredPoems = candidatePoems.filter((poem) => {
        if (isBackToSource && poem.id === previousPoemId) return false;
        return true;
      });

      // If no poems remain after filtering, return null
      if (filteredPoems.length === 0) {
        return null;
      }

      // Rank the remaining poems by overlap score
      const rankedPoems = filteredPoems
        .map((poem) => {
          const key = [currentPoemId, poem.id].sort().join("-");
          const connection = connections.get(key);
          return {
            poem,
            overlapScore: connection?.overlapScore || 0,
          };
        })
        .sort((a, b) => b.overlapScore - a.overlapScore);

      return rankedPoems[0]?.poem || null;
    },
    [currentPoemId, allPoems, connections, navigationHistory, sourceNavigation]
  );

  // Navigation handlers
  const navigateToPoem = useCallback(
    (nextPoemId, viaWord = null) => {
      if (nextPoemId && nextPoemId !== currentPoemId) {
        setNavigationHistory((prev) => [...prev, currentPoemId]);

        // Track the source navigation when using a word
        if (viaWord) {
          setSourceNavigation({
            poemId: currentPoemId,
            word:
              typeof viaWord === "string"
                ? viaWord.toLowerCase()
                : viaWord.toLowerCase(),
          });
        }

        setCurrentPoemId(nextPoemId);
        return true;
      }
      return false;
    },
    [currentPoemId]
  );

  const navigateBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const previousPoemId = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory((prev) => prev.slice(0, -1));
      setCurrentPoemId(previousPoemId);
      return true;
    }
    return false;
  }, [navigationHistory]);

  const currentPoem = useMemo(
    () => allPoems.find((p) => p.id === currentPoemId),
    [allPoems, currentPoemId]
  );

  return {
    currentPoem,
    navigationHistory: navigationHistory.map((id) =>
      allPoems.find((p) => p.id === id)
    ),
    getWordGlowIntensity,
    findNextPoemForWord,
    navigateToPoem,
    navigateBack,
  };
};
