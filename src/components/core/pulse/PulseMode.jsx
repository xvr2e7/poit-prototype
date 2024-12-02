import React, { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { WordCard } from "./components/WordCard";
import { TimeDisplay } from "./components/TimeDisplay";
import { CompletionView } from "./components/CompletionView";
import { ProgressVisualization } from "./components/ProgressVisualization";
import { useWindowSize } from "../../../utils/useWindowSize";

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
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="w-full min-h-screen flex flex-col items-center p-4 md:p-8">
        {/* Header */}
        <div className="w-full max-w-4xl flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">Pulse</h1>
          <TimeDisplay />
        </div>

        {/* Main content area */}
        <div className="w-full max-w-4xl flex-1 flex flex-col justify-center my-8 relative">
          {/* Desktop constellation */}
          {!isMobile && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ProgressVisualization
                words={words}
                selectedWords={selectedWords}
                currentIndex={currentIndex}
              />
            </div>
          )}

          {/* Word card */}
          <div className="relative z-10 w-full max-w-lg mx-auto">
            <AnimatePresence mode="popLayout">
              {currentIndex < words.length ? (
                <WordCard
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
                />
              )}
            </AnimatePresence>
          </div>

          {/* Mobile progress bar */}
          {isMobile && (
            <div className="w-full mt-8">
              <ProgressVisualization
                words={words}
                selectedWords={selectedWords}
                currentIndex={currentIndex}
              />
            </div>
          )}
        </div>

        {/* Word count */}
        <div className="text-gray-600">
          Selected: {selectedWords.length} / {words.length}
        </div>
      </div>
    </div>
  );
};

export default PulseMode;
