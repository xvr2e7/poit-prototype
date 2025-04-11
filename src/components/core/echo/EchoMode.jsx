import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "lucide-react";
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
  onExitToHome,
}) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStartPosition = useRef({ x: 0, y: 0 });

  const {
    currentPoem,
    navigationHistory,
    getWordGlowIntensity,
    findNextPoemForWord,
    navigateToPoem,
  } = usePoemNavigation(poems, wordPool);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleWordClick = async (word, e) => {
    if (!e || isDragging) return;
    const nextPoem = findNextPoemForWord(word.text);
    if (nextPoem) {
      setIsTransitioning(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      navigateToPoem(nextPoem.id);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setIsTransitioning(false);
    }
  };

  // Dragging handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only primary mouse button

    setIsDragging(true);
    dragStartPosition.current = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    };

    e.preventDefault(); // Prevent text selection
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newOffset = {
      x: e.clientX - dragStartPosition.current.x,
      y: e.clientY - dragStartPosition.current.y,
    };

    setDragOffset(newOffset);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add/remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

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
      <Navigation currentMode="echo" onExitToHome={onExitToHome} />

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
                  <Calendar className="w-4 h-4 text-[#2C8C7C]" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {currentPoem.date}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Poem Content Area */}
          <div
            ref={containerRef}
            className="flex-1 relative overflow-hidden"
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            onMouseDown={handleMouseDown}
          >
            {/* Connection Counter */}
            <div
              className="absolute top-4 right-4 flex items-center gap-1.5 
                px-3 py-1.5 rounded-full bg-white/5 dark:bg-gray-950/30 
                backdrop-blur-sm border border-[#2C8C7C]/20 z-10"
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

            {/* Drag hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-900/50 px-2 py-1 rounded-md backdrop-blur-sm">
                Drag to see more
              </span>
            </div>

            {/* Poem Content */}
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                transition: isDragging ? "none" : "transform 0.2s ease-out",
              }}
            >
              <motion.div
                animate={{
                  opacity: isTransitioning ? 0 : 1,
                }}
                transition={{
                  duration: 0.4,
                  ease: "easeInOut",
                }}
                className="w-full h-full"
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
                      isFloating={true}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EchoMode;
