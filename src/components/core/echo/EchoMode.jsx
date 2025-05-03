import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, LogOut } from "lucide-react";
import AdaptiveBackground from "../../shared/AdaptiveBackground";
import Navigation from "../../shared/Navigation";
import WordDisplay from "./components/WordDisplay";
import { usePoemNavigation } from "./hooks/usePoemNavigation";
import NavigationNetworkButton from "./components/NavigationNetworkButton";
import NavigationNetwork from "./components/NavigationNetwork";

const EchoMode = ({
  poems = [],
  wordPool = [],
  enabled = true,
  onExitToHome,
  onSave,
  lastSaved,
}) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [connectingWord, setConnectingWord] = useState(null);
  const [isNetworkVisible, setIsNetworkVisible] = useState(false);
  const [constellationsAdded, setConstellationsAdded] = useState(0);

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

  // Track constellation counts
  const [todayConstellations, setTodayConstellations] = useState(0);
  const [totalConstellations, setTotalConstellations] = useState(0);

  // Initialize constellation counts from localStorage
  useEffect(() => {
    // Load today's and total constellation counts
    const savedTotalConstellations = parseInt(
      localStorage.getItem("poit_total_constellations") || "0"
    );

    // For today's constellations, we need to check if it's a new day
    let savedTodayConstellations = 0;
    const lastConstellationDate = localStorage.getItem(
      "poit_constellation_date"
    );
    const today = new Date().toDateString();

    if (lastConstellationDate === today) {
      // Same day, load saved count
      savedTodayConstellations = parseInt(
        localStorage.getItem("poit_today_constellations") || "0"
      );
    } else {
      // New day, reset today's count
      localStorage.setItem("poit_constellation_date", today);
      localStorage.setItem("poit_today_constellations", "0");
    }

    setTodayConstellations(savedTodayConstellations);
    setTotalConstellations(savedTotalConstellations);
  }, []);

  // Save constellation counts whenever they change
  useEffect(() => {
    localStorage.setItem(
      "poit_today_constellations",
      todayConstellations.toString()
    );
    localStorage.setItem(
      "poit_total_constellations",
      totalConstellations.toString()
    );
  }, [todayConstellations, totalConstellations]);

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

  // Track connecting words between poems
  const [connectingWords, setConnectingWords] = useState({});

  const handleWordClick = async (word, e) => {
    if (!e || isDragging) return;
    const nextPoem = findNextPoemForWord(word.text);
    if (nextPoem) {
      // Set the connecting word (the word that was clicked)
      setConnectingWord(word.text.toLowerCase());

      // Track connecting word in our map
      if (currentPoem) {
        setConnectingWords((prev) => ({
          ...prev,
          [`${currentPoem.id}-${nextPoem.id}`]: word.text.toLowerCase(),
        }));

        // Only count as a constellation if we're navigating to a poem that's not the starting poem
        if (nextPoem.id !== poems[0]?.id) {
          // Increment constellation count
          setConstellationsAdded((prev) => prev + 1);
        }
      }

      setIsTransitioning(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      navigateToPoem(nextPoem.id, word.text);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setIsTransitioning(false);
    }
  };

  useEffect(() => {
    if (constellationsAdded > 0) {
      // Update total constellations
      const totalConstellations = parseInt(
        localStorage.getItem("poit_total_constellations") || "0"
      );
      localStorage.setItem(
        "poit_total_constellations",
        (totalConstellations + constellationsAdded).toString()
      );

      // Update today's constellations
      const todayConstellations = parseInt(
        localStorage.getItem("poit_today_constellations") || "0"
      );
      localStorage.setItem(
        "poit_today_constellations",
        (todayConstellations + constellationsAdded).toString()
      );

      // Reset the counter since we've saved the changes
      setConstellationsAdded(0);
    }
  }, [constellationsAdded]);

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

  // Calculate statistics for network view
  const uniquePoemIds = new Set(
    [...navigationHistory.map((poem) => poem.id), currentPoem?.id].filter(
      Boolean
    )
  );

  const uniquePoemCount = uniquePoemIds.size;

  // Count connections to poems other than the starting one
  const constellationCount = navigationHistory.filter(
    (poem) => poem?.id !== poems[0]?.id
  ).length;

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
      <Navigation
        currentMode="echo"
        onExitToHome={onExitToHome}
        onSave={onSave}
        lastSaved={lastSaved}
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
            </div>

            {/* Network Button */}
            <NavigationNetworkButton
              onClick={() => setIsNetworkVisible(true)}
              isActive={isNetworkVisible}
            />
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
                {currentPoem?.components?.filter(
                  (component) =>
                    component.type === "word" &&
                    wordPool.some(
                      (word) =>
                        (typeof word === "string"
                          ? word.toLowerCase()
                          : word.text.toLowerCase()) ===
                        component.text.toLowerCase()
                    )
                ).length || 0}
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

          {/* Navigation Network */}
          <NavigationNetwork
            isOpen={isNetworkVisible}
            onClose={() => setIsNetworkVisible(false)}
            visitedPoems={[...navigationHistory, currentPoem].filter(Boolean)}
            currentPoemId={currentPoem.id}
            onPoemSelect={navigateToPoem}
            uniquePoemCount={uniquePoemCount}
            constellationCount={constellationCount}
            connectingWords={connectingWords}
          />
        </motion.div>

        {/* Dashboard Menu Button */}
        <motion.button
          onClick={() => onExitToHome("menu")}
          className="fixed bottom-6 right-6 p-3 rounded-full 
        bg-white/10 dark:bg-gray-900/30 backdrop-blur-sm 
        border border-[#2C8C7C]/20 hover:bg-white/20 
        dark:hover:bg-gray-900/50 transition-colors z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Open Dashboard Menu"
        >
          <LogOut className="w-5 h-5 text-[#2C8C7C]" />
        </motion.button>
      </div>
    </div>
  );
};

export default EchoMode;
