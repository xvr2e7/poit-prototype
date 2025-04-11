import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ZoomIn, ZoomOut } from "lucide-react";
import AdaptiveBackground from "../../shared/AdaptiveBackground";
import Navigation from "../../shared/Navigation";
import WordDisplay from "./components/WordDisplay";
import { usePoemNavigation } from "./hooks/usePoemNavigation";
import { NavigationTrail } from "./components/NavigationTrail";

const EchoMode = ({
  poems = [],
  wordPool = [],
  enabled = true,
  onExitToHome,
}) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [connectingWord, setConnectingWord] = useState(null);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStartPosition = useRef({ x: 0, y: 0 });

  // Zoom state
  const [zoomLevel, setZoomLevel] = useState(1);
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2.0;
  const ZOOM_STEP = 0.1;

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

  // Reset drag and zoom when changing poems
  useEffect(() => {
    setDragOffset({ x: 0, y: 0 });
    setZoomLevel(1);
  }, [currentPoem?.id]);

  // Effect to center/zoom on connecting word when poem changes
  useEffect(() => {
    if (
      connectingWord &&
      currentPoem &&
      currentPoem.components &&
      !isTransitioning
    ) {
      // Find the connecting word in the new poem
      const foundWord = currentPoem.components.find(
        (comp) =>
          comp.type === "word" &&
          comp.text.toLowerCase() === connectingWord.toLowerCase()
      );

      if (foundWord && foundWord.position) {
        // Center the view on the connecting word
        const centerX = foundWord.position.x;
        const centerY = foundWord.position.y;

        // Apply a slight zoom in effect
        const newZoomLevel = Math.min(MAX_ZOOM, 1.5);
        setZoomLevel(newZoomLevel);

        // Calculate offset to center the view on the word
        setDragOffset({
          x:
            -centerX * newZoomLevel +
            (containerRef.current?.clientWidth || 0) / 2,
          y:
            -centerY * newZoomLevel +
            (containerRef.current?.clientHeight || 0) / 2,
        });
      }
    }
  }, [currentPoem, connectingWord, isTransitioning]);

  const handleWordClick = async (word, e) => {
    if (!e || isDragging) return;
    const nextPoem = findNextPoemForWord(word.text);
    if (nextPoem) {
      // Set the connecting word (the word that was clicked)
      setConnectingWord(word.text.toLowerCase());
      setIsTransitioning(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      // Pass the connecting word to navigateToPoem
      navigateToPoem(nextPoem.id, word.text);
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

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(MAX_ZOOM, prev + ZOOM_STEP));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(MIN_ZOOM, prev - ZOOM_STEP));
  };

  // Wheel zoom handler
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      // Zoom in/out based on wheel direction
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  };

  // Keyboard handler for zoom controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Zoom in with + or =
      if ((e.key === "+" || e.key === "=") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleZoomIn();
      }
      // Zoom out with -
      else if (e.key === "-" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleZoomOut();
      }
      // Reset zoom with 0
      else if (e.key === "0" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setZoomLevel(1);
        setDragOffset({ x: 0, y: 0 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
            onWheel={handleWheel}
          >
            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 flex flex-row gap-2 z-10">
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-full bg-white/10 dark:bg-gray-900/30 
                  backdrop-blur-sm border border-[#2C8C7C]/20 hover:bg-white/20 
                  dark:hover:bg-gray-900/50 transition-colors"
              >
                <ZoomIn className="w-4 h-4 text-[#2C8C7C]" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-full bg-white/10 dark:bg-gray-900/30 
                  backdrop-blur-sm border border-[#2C8C7C]/20 hover:bg-white/20 
                  dark:hover:bg-gray-900/50 transition-colors"
              >
                <ZoomOut className="w-4 h-4 text-[#2C8C7C]" />
              </button>
              <div
                className="text-center mt-1 text-xs text-[#2C8C7C] bg-white/10 dark:bg-gray-900/30 
                backdrop-blur-sm rounded-md px-1 py-0.5 border border-[#2C8C7C]/20"
              >
                {Math.round(zoomLevel * 100)}%
              </div>
            </div>

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
                Drag to explore • Ctrl+Wheel to zoom
              </span>
            </div>

            {/* Poem Content */}
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: "center",
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
                      connectingWord={connectingWord}
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
