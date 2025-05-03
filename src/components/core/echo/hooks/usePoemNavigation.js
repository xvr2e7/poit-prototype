import { useState, useMemo, useCallback, useEffect } from "react";

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
        setNavigationHistory((prev) => {
          const newHistory = [...prev, currentPoemId];

          // Save navigation history to localStorage
          const historyToSave = newHistory
            .filter(Boolean)
            .map((poemId) => {
              const poem = allPoems.find((p) => p.id === poemId);
              return poem
                ? {
                    id: poem.id,
                    title: poem.title,
                    date: poem.date || new Date().toLocaleDateString(),
                  }
                : null;
            })
            .filter(Boolean);

          localStorage.setItem(
            "poit_navigation_history",
            JSON.stringify(historyToSave)
          );

          return newHistory;
        });

        // Track the source navigation when using a word
        if (viaWord) {
          setSourceNavigation({
            poemId: currentPoemId,
            word:
              typeof viaWord === "string"
                ? viaWord.toLowerCase()
                : viaWord.toLowerCase(),
          });

          // Save the connecting word
          const connectingWords = JSON.parse(
            localStorage.getItem("poit_connecting_words") || "{}"
          );
          connectingWords[`${currentPoemId}-${nextPoemId}`] =
            typeof viaWord === "string"
              ? viaWord.toLowerCase()
              : viaWord.toLowerCase();
          localStorage.setItem(
            "poit_connecting_words",
            JSON.stringify(connectingWords)
          );
        }

        setCurrentPoemId(nextPoemId);
        return true;
      }
      return false;
    },
    [currentPoemId, allPoems]
  );

  useEffect(() => {
    // Load saved navigation history
    try {
      const savedHistory = JSON.parse(
        localStorage.getItem("poit_navigation_history") || "[]"
      );
      if (savedHistory.length > 0) {
        // Convert saved history to navigationHistory format (poem IDs)
        const savedHistoryIds = savedHistory.map((item) => item.id);
        if (savedHistoryIds.length > 0) {
          setNavigationHistory(savedHistoryIds);
        }
      }

      // Load saved connecting words
      const savedConnectingWords = JSON.parse(
        localStorage.getItem("poit_connecting_words") || "{}"
      );
      if (Object.keys(savedConnectingWords).length > 0) {
        // This data will be used in the NavigationNetwork visualization
        // We'll pass it to the component when needed
      }
    } catch (error) {
      console.error("Error loading navigation history:", error);
    }
  }, []);

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
    savedConnectingWords: JSON.parse(
      localStorage.getItem("poit_connecting_words") || "{}"
    ),
  };
};
