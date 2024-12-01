import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { WordCard } from "./components/WordCard";
import { TimeDisplay } from "./components/TimeDisplay";
import { CompletionView } from "./components/CompletionView";
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

  const handleKeepWord = () => {
    if (currentIndex < words.length) {
      setSelectedWords((prev) => [...prev, words[currentIndex]]);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleDiscardWord = () => {
    if (currentIndex < words.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSaveSelection = () => {
    onComplete(selectedWords);
    setSavedSelection(true);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="w-full h-full flex flex-col items-center px-4 py-8">
        {/* Header */}
        <div className="w-full max-w-4xl mb-8 flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">Pulse</h1>
          <TimeDisplay />
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-4xl mb-8">
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(currentIndex / words.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="relative w-full max-w-4xl h-[60vh] flex items-center justify-center">
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

        {/* Selected count */}
        <div className="mt-8 text-gray-600">
          Selected: {selectedWords.length} / {words.length}
        </div>
      </div>
    </div>
  );
};

export default PulseMode;
