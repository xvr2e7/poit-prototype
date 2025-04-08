import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Calendar } from "lucide-react";
import AdaptiveBackground from "../../shared/AdaptiveBackground";
import Navigation from "../../shared/Navigation";
import WordDisplay from "./components/WordDisplay";
import { usePoemNavigation } from "./hooks/usePoemNavigation";
import { NavigationTrail } from "./components/NavigationTrail";

const EchoMode = ({
  poems = [],
  wordPool = [],
  onComplete,
  playgroundUnlocked,
  enterPlayground,
  enabled = true,
}) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const {
    currentPoem,
    navigationHistory,
    getWordGlowIntensity,
    findNextPoemForWord,
    navigateToPoem,
  } = usePoemNavigation(poems, wordPool);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleWordClick = async (word, e) => {
    if (!e) return;
    const nextPoem = findNextPoemForWord(word.text);
    if (nextPoem) {
      setIsTransitioning(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      navigateToPoem(nextPoem.id);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setIsTransitioning(false);
    }
  };

  if (!enabled || !currentPoem) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <span className="text-[#2C8C7C]">Loading poem...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <AdaptiveBackground mode="echo" className="opacity-50" />
      {/* Navigation */}
      <Navigation currentMode="echo" />

      {/* Navigation Trail */}
      <NavigationTrail
        visitedPoems={[...navigationHistory, currentPoem]}
        currentPoemId={currentPoem.id}
        onPoemSelect={navigateToPoem}
      />

      {/* Main Content */}
      <div className="relative w-full h-full p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-6xl mx-auto h-full flex flex-col"
        >
          {/* Poem Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="space-y-1">
              <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
                {currentPoem.title}
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-[#2C8C7C]" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {currentPoem.author}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-[#2C8C7C]" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {currentPoem.date}
                  </span>
                </div>
              </div>
            </div>

            {playgroundUnlocked && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={enterPlayground}
                className="px-4 py-2 rounded-xl bg-[#2C8C7C]/10 
                  hover:bg-[#2C8C7C]/20 text-[#2C8C7C]
                  border border-[#2C8C7C]/20 transition-all duration-300"
              >
                Enter Playground
              </motion.button>
            )}
          </motion.div>

          {/* Poem Content */}
          <div
            ref={containerRef}
            className="flex-1 relative rounded-2xl 
              bg-white/5 dark:bg-gray-950/30
              backdrop-blur-md border border-[#2C8C7C]/20 
              overflow-hidden"
          >
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-b from-[#2C8C7C]/5 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(44,140,124,0.1),transparent_50%)]" />
            </div>

            {/* Connection Counter */}
            <div
              className="absolute top-4 right-4 flex items-center gap-1.5 
              px-3 py-1.5 rounded-full bg-white/5 dark:bg-gray-950/30 
              backdrop-blur-sm border border-[#2C8C7C]/20"
            >
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-[#2C8C7C]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M8,8 A3,3 0 1,1 5,11 A3,3 0 1,1 8,8" />
                  <path d="M16,13 A3,3 0 1,1 19,11 A3,3 0 1,1 16,13" />
                </svg>
              </div>
              <span className="text-sm font-medium text-[#2C8C7C]">
                {currentPoem.metadata.highlightedWordCount}
              </span>
            </div>

            {/* Poem Content */}
            <motion.div
              className="relative h-full overflow-auto p-8"
              animate={{
                opacity: isTransitioning ? 0 : 1,
              }}
              transition={{
                duration: 0.4,
                ease: "easeInOut",
              }}
            >
              <AnimatePresence mode="wait">
                {!isLoading && (
                  <WordDisplay
                    words={currentPoem.components}
                    highlightedWords={wordPool.map((w) =>
                      typeof w === "string" ? w : w.text
                    )}
                    getWordGlowIntensity={getWordGlowIntensity}
                    onWordClick={handleWordClick}
                    isTransitioning={isTransitioning}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EchoMode;
