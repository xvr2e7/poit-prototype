import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Calendar, Clock, ArrowLeft } from "lucide-react";
import UIBackground from "../../shared/UIBackground";
import WordDisplay from "./components/WordDisplay";
import { usePoemNavigation } from "./hooks/usePoemNavigation";

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
    navigateBack,
  } = usePoemNavigation(poems, wordPool);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleWordClick = async (word) => {
    const nextPoem = findNextPoemForWord(word.text);
    if (nextPoem) {
      setIsTransitioning(true);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Wait for exit animations
      navigateToPoem(nextPoem.id);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Wait for enter animations
      setIsTransitioning(false);
    }
  };

  if (!enabled || !currentPoem) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <span className="text-cyan-300">Loading poem...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <UIBackground mode="echo" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full h-full max-w-6xl mx-auto"
      >
        {/* Ambient effects */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent 
            blur-3xl rounded-full scale-150"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/10 
            to-blue-500/5 blur-2xl rounded-full scale-125"
          />
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="h-full backdrop-blur-md bg-white/5 border border-cyan-500/20 
            rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div
            className="px-8 py-6 border-b border-cyan-500/20 
            bg-gradient-to-r from-cyan-500/10 to-transparent"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                {navigationHistory.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={navigateBack}
                    className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 
                      text-cyan-300 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </motion.button>
                )}
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-cyan-50"
                >
                  {currentPoem.title}
                </motion.h2>
              </div>

              {playgroundUnlocked && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={enterPlayground}
                  className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 
                    text-cyan-300 rounded-lg border border-cyan-500/40
                    transition-colors duration-300"
                >
                  Enter Playground
                </motion.button>
              )}
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-cyan-300/70">
                <User className="w-4 h-4" />
                <span className="text-sm">{currentPoem.author}</span>
              </div>
              <div className="flex items-center space-x-2 text-cyan-300/70">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{currentPoem.date}</span>
              </div>
            </div>
          </div>

          {/* Scrollable poem space */}
          <div
            ref={containerRef}
            className="h-[calc(100%-10rem)] overflow-auto"
            style={{
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* Content container with increased dimensions for scrolling */}
            <div className="relative min-h-[200%] min-w-[150%] p-12">
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
            </div>
          </div>

          {/* Footer */}
          <div
            className="h-16 px-8 py-4 border-t border-cyan-500/20 
            bg-gradient-to-r from-transparent to-cyan-500/10"
          >
            <div className="flex justify-between items-center">
              <div className="text-sm text-cyan-300/60">
                {`${currentPoem.metadata.highlightedWordCount} highlighted connections`}
              </div>
              <div className="flex items-center space-x-2 text-sm text-cyan-300/60">
                <Clock className="w-4 h-4" />
                <span>Recently created</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EchoMode;
