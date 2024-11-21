import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Check, X } from "lucide-react";

const SWIPE_THRESHOLD = 100;

const PulseMode = ({ onComplete }) => {
  // Sample daily words - in production, this would come from your backend
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
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [savedSelection, setSavedSelection] = useState(false);
  const cardRef = useRef(null);

  const handleDragStart = (event, info) => {
    setDragStart({ x: info.point.x, y: info.point.y });
  };

  const handleDragEnd = (event, info) => {
    const deltaX = info.point.x - dragStart.x;

    if (deltaX > SWIPE_THRESHOLD) {
      handleKeepWord();
    } else if (deltaX < -SWIPE_THRESHOLD) {
      handleDiscardWord();
    }
  };

  const handleKeepWord = () => {
    if (currentIndex < words.length) {
      const newSelectedWords = [...selectedWords, words[currentIndex]];
      setSelectedWords(newSelectedWords);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDiscardWord = () => {
    if (currentIndex < words.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSaveSelection = () => {
    console.log("Selected words:", selectedWords);
    onComplete(selectedWords);
    setSavedSelection(true);
  };

  const progress = (currentIndex / words.length) * 100;

  // Calculate time until next refresh (midnight)
  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  const hoursUntilReset = Math.floor((tomorrow - now) / (1000 * 60 * 60));
  const minutesUntilReset = Math.floor(
    ((tomorrow - now) % (1000 * 60 * 60)) / (1000 * 60)
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="w-full h-full flex flex-col items-center px-4 py-8">
        {/* Header with Reset Timer */}
        <div className="w-full md:w-[800px] mb-8 flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">Pulse</h1>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              Resets in {hoursUntilReset}h {minutesUntilReset}m
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full md:w-[800px] h-2 bg-gray-200 rounded-full mb-8">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Word Cards */}
        <div className="relative w-full md:w-[800px] h-[60vh] max-h-[600px]">
          <AnimatePresence>
            {currentIndex < words.length ? (
              <motion.div
                ref={cardRef}
                key={currentIndex}
                className="absolute w-full h-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                whileDrag={{ scale: 1.05 }}
              >
                <div className="w-full h-full bg-white rounded-xl shadow-xl p-8 flex flex-col items-center justify-center">
                  <h2 className="text-4xl font-bold text-gray-800 mb-4">
                    {words[currentIndex]}
                  </h2>
                  <div className="flex gap-8 mt-8">
                    <button
                      onClick={handleDiscardWord}
                      className="p-4 bg-red-100 rounded-full text-red-500 hover:bg-red-200 transition-colors"
                    >
                      <X className="w-8 h-8" />
                    </button>
                    <button
                      onClick={handleKeepWord}
                      className="p-4 bg-green-100 rounded-full text-green-500 hover:bg-green-200 transition-colors"
                    >
                      <Check className="w-8 h-8" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="absolute w-full h-full flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-xl shadow-xl">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    All done!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    You've selected {selectedWords.length} words
                  </p>
                  <div className="flex flex-col gap-4">
                    {!savedSelection ? (
                      <>
                        <div className="text-sm text-gray-500">
                          Click the button below to save your selection. Then
                          use the navigation above to move to Craft mode.
                        </div>
                        <button
                          onClick={handleSaveSelection}
                          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Save Selection
                        </button>
                      </>
                    ) : (
                      <div className="text-sm text-green-600 font-medium">
                        ✓ Selection saved! Use the navigation above to move to
                        Craft mode.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected Words Count */}
        <div className="mt-8 text-gray-600">
          Selected: {selectedWords.length} / {words.length}
        </div>
      </div>
    </div>
  );
};

export default PulseMode;
