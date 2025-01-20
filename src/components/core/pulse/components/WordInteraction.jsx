import React, { useState, useRef, useEffect } from "react";

const INTERACTION_TIME = 2000; // 2 seconds for selection
const PROXIMITY_THRESHOLD = 50; // Distance threshold for interaction
const HYSTERESIS_FACTOR = 1.2; // Allow slightly more distance once interaction starts

export const useWordInteraction = (selectorPosition, wordPositions) => {
  const [interactingWord, setInteractingWord] = useState(null);
  const [interactionProgress, setInteractionProgress] = useState(0);
  const [proximityMap, setProximityMap] = useState(new Map());
  const interactionStartRef = useRef(null);
  const lastInteractionCheckRef = useRef(0);

  useEffect(() => {
    if (!selectorPosition || !wordPositions) return;

    let rafId;
    const checkProximity = () => {
      const now = performance.now();
      if (now - lastInteractionCheckRef.current < 16) {
        rafId = requestAnimationFrame(checkProximity);
        return;
      }
      lastInteractionCheckRef.current = now;

      const newProximityMap = new Map();
      let closestDistance = Infinity;
      let closestWordId = null;

      // Check each word's distance to selector
      wordPositions.forEach((rect, wordId) => {
        const wordCenterX = rect.x + rect.width / 2;
        const wordCenterY = rect.y + rect.height / 2;

        const distance = Math.sqrt(
          Math.pow(selectorPosition.x - wordCenterX, 2) +
            Math.pow(selectorPosition.y - wordCenterY, 2)
        );

        // Calculate proximity value (0 to 1)
        const maxDistance = PROXIMITY_THRESHOLD * 2;
        const proximity = Math.max(0, 1 - distance / maxDistance);
        newProximityMap.set(wordId, proximity);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestWordId = wordId;
        }
      });

      setProximityMap(newProximityMap);

      // Determine interaction threshold based on current state
      const currentThreshold =
        interactingWord === closestWordId
          ? PROXIMITY_THRESHOLD * HYSTERESIS_FACTOR
          : PROXIMITY_THRESHOLD;

      if (closestDistance < currentThreshold) {
        if (!interactionStartRef.current || interactingWord !== closestWordId) {
          interactionStartRef.current = now;
          setInteractingWord(closestWordId);
          setInteractionProgress(0);
        } else {
          const progress = Math.min(
            (now - interactionStartRef.current) / INTERACTION_TIME,
            1
          );
          setInteractionProgress(progress);
        }
      } else if (interactingWord === closestWordId) {
        // Only reset if we're moving away from the currently interacting word
        interactionStartRef.current = null;
        setInteractingWord(null);
        setInteractionProgress(0);
      }

      rafId = requestAnimationFrame(checkProximity);
    };

    checkProximity();

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [selectorPosition, wordPositions, interactingWord]);

  return {
    interactingWord,
    interactionProgress,
    isInteractionComplete: interactionProgress === 1,
    proximityMap,
  };
};

const WordInteraction = ({
  selectorPosition,
  wordPositions,
  onWordSelect,
  children,
}) => {
  const {
    interactingWord,
    interactionProgress,
    isInteractionComplete,
    proximityMap,
  } = useWordInteraction(selectorPosition, wordPositions);

  useEffect(() => {
    if (isInteractionComplete && interactingWord) {
      onWordSelect(interactingWord);
    }
  }, [isInteractionComplete, interactingWord, onWordSelect]);

  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        interactingWord,
        interactionProgress,
        proximityMap,
        onInteractionComplete: () => {
          if (interactingWord) {
            onWordSelect(interactingWord);
          }
        },
      });
    }
    return child;
  });

  return <>{enhancedChildren}</>;
};

export default WordInteraction;
