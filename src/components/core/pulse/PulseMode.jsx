import React, { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import WordPool from "./components/WordPool";
import { TimeDisplay } from "./components/TimeDisplay";
import { CompletionView } from "./components/CompletionView";
import GrowingWordSelector from "./components/GrowingWordSelector";
import PulseBackground from "./components/PulseBackground";

const PulseMode = ({ onComplete }) => {
  const [selectedWords, setSelectedWords] = useState([]);
  const [savedSelection, setSavedSelection] = useState(false);
  const wordPositionsRef = useRef(new Map());

  const handleWordPositionUpdate = useCallback((wordId, rect) => {
    wordPositionsRef.current.set(wordId, rect);
  }, []);

  const handleSelectorMove = useCallback(
    (selectorPos) => {
      const selectorRadius = 15; // Match this with the selector's visual size

      // Check collision with each word
      wordPositionsRef.current.forEach((rect, wordId) => {
        if (selectedWords.includes(wordId)) return; // Skip if already selected

        const wordCenterX = rect.x + rect.width / 2;
        const wordCenterY = rect.y + rect.height / 2;

        // Calculate distance between selector and word center
        const dx = selectorPos.x - wordCenterX;
        const dy = selectorPos.y - wordCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If collision detected and word not already selected
        if (distance < selectorRadius + rect.width / 2) {
          setSelectedWords((prev) => [...prev, wordId]);
        }
      });
    },
    [selectedWords]
  );

  const handleSaveSelection = () => {
    setSavedSelection(true);
    onComplete(selectedWords);
  };

  return (
    <div className="w-full min-h-screen relative overflow-hidden">
      <PulseBackground />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-4xl flex items-center justify-between p-4 mt-4 rounded-xl border border-cyan-500/20 backdrop-blur-sm bg-white/5"
        >
          <motion.h1
            className="text-2xl font-bold text-cyan-300"
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Pulse
          </motion.h1>
          <TimeDisplay />
        </motion.div>
      </div>

      {/* Main content */}
      <div className="absolute inset-0 z-10">
        {selectedWords.length < 45 ? (
          <>
            <WordPool
              selectedWords={selectedWords}
              onPositionUpdate={handleWordPositionUpdate}
            />
            <GrowingWordSelector
              selectedWords={selectedWords}
              minWords={15}
              maxWords={45}
              onMove={handleSelectorMove}
            />
          </>
        ) : (
          <CompletionView
            selectedCount={selectedWords.length}
            totalCount={45}
            onSave={handleSaveSelection}
            saved={savedSelection}
            selectedWords={selectedWords}
          />
        )}
      </div>

      {/* Word counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-cyan-300/40 text-sm"
      >
        {selectedWords.length < 15
          ? "Gather more words..."
          : selectedWords.length <= 45
          ? "Collection growing nicely"
          : "Maximum words reached"}
      </motion.div>
    </div>
  );
};

export default PulseMode;
