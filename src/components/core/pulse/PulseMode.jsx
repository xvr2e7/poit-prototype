import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WordPool from "./components/WordPool";
import { TimeDisplay } from "./components/TimeDisplay";
import { CompletionView } from "./components/CompletionView";
import { ProgressVisualization } from "./components/ProgressVisualization";
import AnimatedBackground from "./components/AnimatedBackground";
import { useWindowSize } from "../../../utils/hooks/useWindowSize";

const PulseMode = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [savedSelection, setSavedSelection] = useState(false);
  const { isMobile } = useWindowSize();

  const handleKeepWord = useCallback((word) => {
    setSelectedWords((prev) => [...prev, word.text]);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handleDiscardWord = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handleSaveSelection = () => {
    onComplete(selectedWords);
    setSavedSelection(true);
  };

  return (
    <div className="w-full min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      {/* Progress visualization */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <ProgressVisualization
          words={Array(20).fill("")} // Using total number of words in pool
          selectedWords={selectedWords}
          currentIndex={currentIndex}
          darkMode
        />
      </div>

      {/* Header with floating effect */}
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
          <TimeDisplay darkMode />
        </motion.div>
      </div>

      {/* Main content */}
      <div className="absolute inset-0 z-10">
        <AnimatePresence mode="popLayout">
          {currentIndex < 20 ? (
            <WordPool
              onWordSelect={handleKeepWord}
              onWordDiscard={handleDiscardWord}
            />
          ) : (
            <CompletionView
              selectedCount={selectedWords.length}
              totalCount={20}
              onSave={handleSaveSelection}
              saved={savedSelection}
              darkMode
            />
          )}
        </AnimatePresence>
      </div>

      {/* Word counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-cyan-300/60"
      >
        Selected: {selectedWords.length} / 20
      </motion.div>
    </div>
  );
};

export default PulseMode;
