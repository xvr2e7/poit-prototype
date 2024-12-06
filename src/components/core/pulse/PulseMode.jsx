import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WordCard from "./components/WordPool";
import { TimeDisplay } from "./components/TimeDisplay";
import { CompletionView } from "./components/CompletionView";
import { ProgressVisualization } from "./components/ProgressVisualization";
import AnimatedBackground from "./components/AnimatedBackground";
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
    <div className="w-full min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 w-full min-h-screen flex flex-col items-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl flex items-center justify-between p-4 rounded-xl border border-cyan-500/20 backdrop-blur-sm bg-white/5"
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

        <div className="w-full max-w-4xl flex-1 flex flex-col justify-center my-8 relative">
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
