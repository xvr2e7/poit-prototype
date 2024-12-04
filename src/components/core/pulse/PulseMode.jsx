// src/components/core/pulse/PulseMode.jsx

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WordCard from "./components/WordCard";
import { TimeDisplay } from "./components/TimeDisplay";
import { CompletionView } from "./components/CompletionView";
import { ProgressVisualization } from "./components/ProgressVisualization";
import { useWindowSize } from "../../../utils/hooks/useWindowSize";

const PulseMode = ({ onComplete }) => {
  const [words] = useState([
    "ethereal",
    "whisper",
    "cascade",
    "luminous",
    "serenity",
    "velvet",
    "cipher",
    "eclipse",
    "nebula",
    "harmony",
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [savedSelection, setSavedSelection] = useState(false);
  const { isMobile } = useWindowSize();

  const handleKeepWord = useCallback(() => {
    if (currentIndex < words.length) {
      setSelectedWords((prev) => [...prev, words[currentIndex]]);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, words]);

  const handleDiscardWord = useCallback(() => {
    if (currentIndex < words.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, words]);

  const handleSaveSelection = () => {
    onComplete(selectedWords);
    setSavedSelection(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#1a1f3d] relative overflow-hidden">
      {/* Deep water gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 to-transparent pointer-events-none" />

      <div className="relative z-10 w-full min-h-screen flex flex-col items-center p-4 md:p-8">
        {/* Header - Now more subtle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl flex items-center justify-between p-4 bg-white/5 backdrop-blur-lg rounded-lg"
        >
          <h1 className="text-2xl font-bold text-cyan-300">Pulse</h1>
          <TimeDisplay darkMode />
        </motion.div>

        {/* Main content area */}
        <div className="w-full max-w-4xl flex-1 flex flex-col justify-center my-8 relative">
          {/* Desktop constellation */}
          {!isMobile && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ProgressVisualization
                words={words}
                selectedWords={selectedWords}
                currentIndex={currentIndex}
                darkMode
              />
            </div>
          )}

          {/* Word card */}
          <div className="relative z-10 w-full max-w-lg mx-auto">
            <AnimatePresence mode="popLayout">
              {currentIndex < words.length ? (
                <WordCard
                  key={currentIndex}
                  word={words[currentIndex]}
                  onKeep={handleKeepWord}
                  onDiscard={handleDiscardWord}
                />
              ) : (
                <CompletionView
                  selectedCount={selectedWords.length}
                  totalCount={words.length}
                  onSave={handleSaveSelection}
                  saved={savedSelection}
                  darkMode
                />
              )}
            </AnimatePresence>
          </div>

          {/* Mobile progress */}
          {isMobile && (
            <div className="w-full mt-8">
              <ProgressVisualization
                words={words}
                selectedWords={selectedWords}
                currentIndex={currentIndex}
                darkMode
              />
            </div>
          )}
        </div>

        {/* Word count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-cyan-300/60"
        >
          Selected: {selectedWords.length} / {words.length}
        </motion.div>
      </div>
    </div>
  );
};

export default PulseMode;
