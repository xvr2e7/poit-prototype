import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Check, X, Info, Layout } from "lucide-react";

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
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
  const [showContext, setShowContext] = useState(false);

  const cardRef = useRef(null);

  // Responsive handler
  React.useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleKeepWord = () => {
    if (currentIndex < words.length) {
      setSelectedWords([...selectedWords, words[currentIndex]]);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDiscardWord = () => {
    if (currentIndex < words.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const toggleContext = () => {
    setShowContext(!showContext);
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
      <div
        className={`w-full h-full flex ${
          isDesktop ? "flex-row" : "flex-col"
        } p-4`}
      >
        {/* Left side - Context Panel (Desktop) or Bottom Sheet (Mobile) */}
        {showContext && (
          <motion.div
            initial={isDesktop ? { x: -300 } : { y: 300 }}
            animate={isDesktop ? { x: 0 } : { y: 0 }}
            className={`
              bg-white rounded-lg shadow-lg
              ${
                isDesktop
                  ? "w-80 h-full mr-4"
                  : "fixed bottom-0 left-0 right-0 h-64 z-50"
              }
            `}
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Word Context</h3>
              {currentIndex < words.length && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Etymology</h4>
                    <p className="text-gray-600">Etymology details here...</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Usage Examples</h4>
                    <p className="text-gray-600">Usage examples here...</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col ${isDesktop ? "" : "items-center"}`}
        >
          {/* Header */}
          <div className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-md mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Pulse</h1>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>
                Resets in {hoursUntilReset}h {minutesUntilReset}m
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Word Display */}
          <div className="relative w-full max-w-2xl mx-auto h-[60vh]">
            <AnimatePresence>
              {currentIndex < words.length ? (
                <motion.div
                  ref={cardRef}
                  key={currentIndex}
                  className="absolute w-full h-full"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
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
                        onClick={toggleContext}
                        className="p-4 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                      >
                        <Info className="w-8 h-8" />
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
                    <button
                      onClick={() => onComplete(selectedWords)}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Selected Words Count */}
          <div className="mt-8 text-center text-gray-600">
            Selected: {selectedWords.length} / {words.length}
          </div>
        </div>

        {/* Right side - Progress Constellation (Desktop only) */}
        {isDesktop && (
          <div className="w-80 bg-white rounded-lg shadow-lg ml-4 p-4">
            <h3 className="text-lg font-semibold mb-4">Progress</h3>
            {/* Constellation view will be implemented in next phase */}
            <div className="h-full flex items-center justify-center text-gray-400">
              <Layout className="w-8 h-8" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PulseMode;
