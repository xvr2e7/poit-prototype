import React, { useState, useCallback, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Clock, Check, X } from "lucide-react";

// Custom hook for responsive design
const useWindowSize = () => {
  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);

  useEffect(() => {
    const handler = () => setSize([window.innerWidth, window.innerHeight]);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return { width: size[0], isMobile: size[0] < 768 };
};

// Optimized word card component
const WordCard = React.memo(({ word, onKeep, onDiscard, isActive }) => {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);
  const scale = useTransform(x, [-100, 0, 100], [0.8, 1, 0.8]);
  const rotate = useTransform(x, [-100, 0, 100], [-10, 0, 10]);
  const background = useTransform(
    x,
    [-100, 0, 100],
    [
      "rgba(239, 68, 68, 0.1)",
      "rgba(255, 255, 255, 1)",
      "rgba(34, 197, 94, 0.1)",
    ]
  );

  const handleDragEnd = useCallback(
    (_, info) => {
      const velocity = info.velocity.x;
      if (Math.abs(velocity) > 500) {
        velocity > 0 ? onKeep() : onDiscard();
      } else {
        const offset = info.offset.x;
        if (offset > 100) onKeep();
        else if (offset < -100) onDiscard();
      }
    },
    [onKeep, onDiscard]
  );

  return (
    <motion.div
      style={{ x, opacity, scale, rotate, background }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      className={`absolute w-full max-w-lg rounded-xl shadow-xl p-8 
                  ${
                    isActive
                      ? "cursor-grab active:cursor-grabbing"
                      : "pointer-events-none"
                  }`}
    >
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">{word}</h2>

        <div className="flex items-center justify-center space-x-8 mt-6 opacity-50">
          <X className="w-6 h-6 text-red-500" />
          <div className="text-sm text-gray-500">Drag to choose</div>
          <Check className="w-6 h-6 text-green-500" />
        </div>
      </div>
    </motion.div>
  );
});

// Progress visualization component
const ProgressConstellation = ({ words, selectedWords, currentIndex }) => {
  const { isMobile } = useWindowSize();

  if (isMobile) {
    return (
      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${(currentIndex / words.length) * 100}%` }}
        />
      </div>
    );
  }

  return (
    <div className="relative w-64 h-64">
      <svg viewBox="-120 -120 240 240">
        {words.map((word, i) => {
          const angle = (i * 2 * Math.PI) / words.length;
          const x = Math.cos(angle) * 100;
          const y = Math.sin(angle) * 100;
          const status =
            i < currentIndex
              ? selectedWords.includes(words[i])
                ? "selected"
                : "discarded"
              : i === currentIndex
              ? "current"
              : "pending";

          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={4}
                className={`transition-colors duration-300 ${
                  status === "selected"
                    ? "fill-green-500"
                    : status === "discarded"
                    ? "fill-red-500"
                    : status === "current"
                    ? "fill-blue-500"
                    : "fill-gray-300"
                }`}
              />
              {i > 0 && (
                <line
                  x1={x}
                  y1={y}
                  x2={Math.cos(((i - 1) * 2 * Math.PI) / words.length) * 100}
                  y2={Math.sin(((i - 1) * 2 * Math.PI) / words.length) * 100}
                  className="stroke-gray-200"
                  strokeWidth={1}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Timer component
const TimeUntilReset = () => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );
      const diff = tomorrow - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center text-gray-600">
      <Clock className="w-4 h-4 mr-2" />
      <span>Resets in {timeLeft}</span>
    </div>
  );
};

// Main component
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

  const handleKeyPress = useCallback(
    (e) => {
      if (currentIndex >= words.length) return;
      if (e.key === "ArrowRight") handleKeepWord();
      if (e.key === "ArrowLeft") handleDiscardWord();
    },
    [currentIndex, words.length, handleKeepWord, handleDiscardWord]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

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
          <TimeUntilReset />
        </div>

        {/* Main content */}
        <div className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-8">
          {/* Word cards container */}
          <div className="relative w-full md:w-2/3 h-[60vh] flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              {currentIndex < words.length ? (
                <WordCard
                  key={currentIndex}
                  word={words[currentIndex]}
                  onKeep={handleKeepWord}
                  onDiscard={handleDiscardWord}
                  isActive
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-8 rounded-xl shadow-xl text-center"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    All done!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    You've selected {selectedWords.length} words
                  </p>
                  {!savedSelection ? (
                    <button
                      onClick={handleSaveSelection}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Save Selection
                    </button>
                  ) : (
                    <p className="text-green-600 font-medium">
                      ✓ Selection saved
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress visualization */}
          {!isMobile && (
            <div className="w-full md:w-1/3">
              <ProgressConstellation
                words={words}
                selectedWords={selectedWords}
                currentIndex={currentIndex}
              />
            </div>
          )}
        </div>

        {/* Mobile progress bar */}
        {isMobile && (
          <div className="w-full max-w-4xl mt-8">
            <ProgressConstellation
              words={words}
              selectedWords={selectedWords}
              currentIndex={currentIndex}
            />
          </div>
        )}

        {/* Selected count */}
        <div className="mt-8 text-gray-600">
          Selected: {selectedWords.length} / {words.length}
        </div>
      </div>
    </div>
  );
};

export default PulseMode;
