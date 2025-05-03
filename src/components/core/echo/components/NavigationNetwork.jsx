import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Book,
  Network,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Telescope,
} from "lucide-react";

// Represents a single word in the 3D poem layer
const WordNode = ({
  word,
  scaleFactor,
  isHighlighted,
  isConnecting,
  isSharedWord = false,
  isSharedNonPool = false,
  constellationMode = false,
  poemIndex,
  adjacentPoems = [],
}) => {
  // Scale position based on scaleFactor to ensure everything fits
  const position = {
    x: (word.position?.x || 0) * scaleFactor,
    y: (word.position?.y || 0) * scaleFactor,
  };

  // If we're in constellation mode, only show shared words as stars
  if (constellationMode) {
    // Only render if this is a shared word (of any type)
    if (!isSharedWord && !isSharedNonPool && !isConnecting) return null;

    return (
      <div
        className="absolute select-none pointer-events-none"
        style={{
          left: position.x,
          top: position.y,
          transformStyle: "preserve-3d",
          transform: "translateZ(1px)",
        }}
      >
        {/* Star point - different styling based on word type */}
        <div
          className={`w-2 h-2 rounded-full ${
            isConnecting
              ? "bg-[#2C8C7C]"
              : isSharedWord
              ? "bg-[#2C8C7C]/80"
              : "bg-[#2C8C7C]/40" // Dimmer for non-pool shared words
          }`}
          style={{
            boxShadow: isConnecting
              ? "0 0 8px 3px rgba(44, 140, 124, 0.8)"
              : isSharedWord
              ? "0 0 5px 2px rgba(44, 140, 124, 0.6)"
              : "0 0 3px 1px rgba(44, 140, 124, 0.3)", // Dimmer glow for non-pool shared words
            transform: "translate(-50%, -50%)",
            opacity: isConnecting ? 1 : isSharedWord ? 0.8 : 0.6,
          }}
        />
      </div>
    );
  }

  // Determine style based on word status for normal view
  let wordStyle = "";

  if (isConnecting) {
    // Navigation word - full highlighting
    wordStyle = "bg-[#2C8C7C] text-white shadow-lg";
  } else if (isSharedWord) {
    // Word pool shared word - text color highlighting
    wordStyle = "bg-[#2C8C7C]/15 text-[#2C8C7C] dark:text-[#2C8C7C]";
  } else if (isSharedNonPool) {
    // Non-word pool shared word - subtle highlighting
    wordStyle =
      "bg-gray-400/10 dark:bg-gray-400/5 text-gray-500 dark:text-gray-400";
  } else {
    // Regular word - default styling
    wordStyle = "text-gray-400/80 dark:text-gray-400/80";
  }

  // Font weight styling
  const fontWeight =
    isConnecting || isSharedWord ? 500 : isSharedNonPool ? 400 : 400;

  return (
    <div
      className="absolute select-none pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transformStyle: "preserve-3d",
        transform: "translateZ(1px)",
      }}
    >
      <div
        className={`px-2 py-1 rounded-md whitespace-nowrap ${wordStyle}`}
        style={{
          fontSize: isConnecting ? "14px" : "12px",
          fontWeight: fontWeight,
          transform: `scale(${scaleFactor})`,
          transformOrigin: "top left",
        }}
      >
        {word.text}
      </div>
    </div>
  );
};

// A complete poem layer in 3D space
const PoemCanvas = ({
  poem,
  layer,
  activeLayer,
  totalLayers,
  highlightedWords,
  connectingWord,
  opacity = 1,
  onClickFrame,
  onDoubleClick,
  isStacked = true,
  sharedWordsMap = new Map(),
  constellationMode = false,
}) => {
  if (!poem || !poem.components) return null;

  // Get words from the poem's components
  const words = poem.components.filter((comp) => comp.type === "word");

  // Calculate position in stack - reversed to have latest at top/front
  const layerPosition = totalLayers - 1 - layer;

  // Calculate stack offset for tilted view
  const offsetFromActive =
    isStacked && activeLayer !== null
      ? layerPosition - (totalLayers - 1 - activeLayer)
      : layerPosition;
  const horizontalOffset = isStacked ? offsetFromActive * 40 : 0;
  const verticalOffset = isStacked ? offsetFromActive * 20 : 0;

  // Calculate z-index and z-position for stacked view
  const zOffset = isStacked ? -120 * offsetFromActive : 0;
  const zIndex = isStacked ? 100 - Math.abs(offsetFromActive) : 100;

  // Standard canvas size for all poems
  const canvasWidth = 1000;
  const canvasHeight = 600;

  // Calculate scale factor to ensure all words fit within canvas
  const scaleFactor = useMemo(() => {
    if (!words.length) return 1;

    // Find the bounding box of all words
    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;

    words.forEach((word) => {
      const x = word.position?.x || 0;
      const y = word.position?.y || 0;

      // Estimate width and height of word (approximation)
      const width = word.text.length * 8; // Rough estimate of word width
      const height = 20; // Rough estimate of word height

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });

    // Calculate scale factor to fit everything
    // Leave margin on all sides
    const margin = 100;
    const contentWidth = maxX - minX + 2 * margin;
    const contentHeight = maxY - minY + 2 * margin;

    const scaleX = canvasWidth / contentWidth;
    const scaleY = canvasHeight / contentHeight;

    // Use the smaller scale to ensure everything fits
    return Math.min(scaleX, scaleY, 1); // Cap at 1 to avoid enlarging small poems
  }, [words, canvasWidth, canvasHeight]);

  // Calculate if this is the active layer
  const isActiveLayer = layer === activeLayer;

  // Transform style for layers in the stack
  const layerTransform = isStacked
    ? `translateX(${horizontalOffset}px) translateY(${verticalOffset}px) translateZ(${zOffset}px) rotateY(-15deg)`
    : "translateZ(0px)";

  // Scale and size for 2D view (when not stacked)
  const layerScale = isStacked ? 1 : 1.5;
  const layerSize = isStacked
    ? { width: canvasWidth, height: canvasHeight }
    : { width: "100%", height: "100%" };

  // Handler for frame click - only trigger when clicking on the frame border
  const handleFrameClick = (e) => {
    // Get the click position relative to the target
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Define border thickness - consider this the frame edge
    const borderThickness = 30; // Larger value to make it easier to click

    // Check if the click is on the frame border
    const isOnBorder =
      x < borderThickness ||
      x > rect.width - borderThickness ||
      y < borderThickness ||
      y > rect.height - borderThickness;

    // Only process click if it's on the border
    if (isOnBorder && onClickFrame) {
      onClickFrame(layer);
      e.stopPropagation();
    }
  };

  return (
    <div
      className={`absolute transition-all duration-300 ease-out ${
        isActiveLayer ? "z-10" : ""
      }`}
      style={{
        ...layerSize,
        left: isStacked ? -canvasWidth / 2 : 0,
        top: isStacked ? -canvasHeight / 2 : 0,
        transform: layerTransform,
        transformStyle: "preserve-3d",
        opacity: isActiveLayer ? 1 : opacity,
        zIndex: zIndex,
      }}
      onClick={handleFrameClick}
      onDoubleClick={(e) => {
        if (onDoubleClick) {
          onDoubleClick(layer);
          e.stopPropagation();
        }
      }}
    >
      {/* Layer background */}
      <div
        className={`absolute inset-0 rounded-xl overflow-hidden
          border-2 transition-all duration-300 ${
            isActiveLayer ? "border-[#2C8C7C]/60" : "border-[#2C8C7C]/10"
          } ${
          constellationMode
            ? "bg-transparent border-transparent shadow-none"
            : "bg-gray-800/90 shadow-lg"
        }`}
        style={{ transform: "translateZ(0px)" }}
      >
        {/* Active layer indicator */}
        {isActiveLayer && !constellationMode && (
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              boxShadow: "0 0 20px rgba(44, 140, 124, 0.3) inset",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Poem title */}
        {!constellationMode && (
          <div className="absolute top-4 left-4 p-2">
            <h3 className="text-lg font-medium text-gray-200">{poem.title}</h3>
          </div>
        )}
      </div>

      {/* Words */}
      {words.map((word, index) => {
        const isShared = sharedWordsMap.has(word.text.toLowerCase());

        return (
          <WordNode
            key={`${poem.id}-word-${index}-${word.text}`}
            word={word}
            scaleFactor={scaleFactor * layerScale}
            isHighlighted={highlightedWords.includes(word.text.toLowerCase())}
            isConnecting={connectingWord === word.text.toLowerCase()}
            isSharedWord={isShared}
            constellationMode={constellationMode}
          />
        );
      })}
    </div>
  );
};

// Main component
const NavigationNetwork = ({
  isOpen,
  onClose,
  visitedPoems = [],
  currentPoemId,
  onPoemSelect,
  uniquePoemCount,
  constellationCount,
  wordPool = [],
  connectingWords = {},
  savedConnectingWords = {},
}) => {
  const containerRef = useRef(null);

  // Merge saved connecting words with current session words
  const allConnectingWords = useMemo(() => {
    return { ...savedConnectingWords, ...connectingWords };
  }, [connectingWords, savedConnectingWords]);

  // Update all uses of connectingWords to use allConnectingWords

  // When saving the network state:
  const saveNetworkState = () => {
    // Save the current state of the network visualization
    localStorage.setItem(
      "poit_network_state",
      JSON.stringify({
        activePoems: visitedPoems.map((poem) => poem.id),
        activeConnections: Object.keys(allConnectingWords),
        lastVisited: new Date().toISOString(),
      })
    );
  };

  // Call saveNetworkState when the component is closed
  const handleClose = () => {
    saveNetworkState();
    onClose();
  };

  // Helper function to find shared words between adjacent poems
  const getSharedWordsMap = (poems) => {
    if (!poems || poems.length < 2) return new Map();

    const sharedWordsMap = new Map();

    // Find shared words between adjacent poems
    for (let i = 0; i < poems.length - 1; i++) {
      const poem1 = poems[i];
      const poem2 = poems[i + 1];

      if (!poem1?.components || !poem2?.components) continue;

      const poem1Words = poem1.components
        .filter((comp) => comp.type === "word")
        .map((word) => word.text.toLowerCase());

      const poem2Words = poem2.components
        .filter((comp) => comp.type === "word")
        .map((word) => word.text.toLowerCase());

      // Find shared words
      const sharedWords = poem1Words.filter((word) =>
        poem2Words.includes(word)
      );

      // Store in map
      for (const word of sharedWords) {
        if (!sharedWordsMap.has(word)) {
          sharedWordsMap.set(word, new Set());
        }
        sharedWordsMap.get(word).add(i);
        sharedWordsMap.get(word).add(i + 1);
      }
    }

    return sharedWordsMap;
  };

  // State for 3D controls
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState({ x: 0, y: -12 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });
  const [showConstellation, setShowConstellation] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Layer navigation state - start with no active layer
  const [activeLayer, setActiveLayer] = useState(null);

  // 2D view state
  const [isIn2DView, setIsIn2DView] = useState(false);

  // Enhanced word connections that calculate actual positions
  const wordConnections = useMemo(() => {
    if (!visitedPoems || visitedPoems.length < 2) return [];

    const connections = [];

    // Process each adjacent poem pair
    for (let i = 0; i < visitedPoems.length - 1; i++) {
      const fromPoem = visitedPoems[i];
      const toPoem = visitedPoems[i + 1];

      if (!fromPoem || !toPoem || !fromPoem.components || !toPoem.components)
        continue;

      // Extract all words from both poems
      const fromWords = fromPoem.components.filter(
        (comp) => comp.type === "word"
      );
      const toWords = toPoem.components.filter((comp) => comp.type === "word");

      // Find shared words between the two poems
      for (const fromWord of fromWords) {
        const matchingToWords = toWords.filter(
          (toWord) => toWord.text.toLowerCase() === fromWord.text.toLowerCase()
        );

        // Create connections for each shared word
        for (const toWord of matchingToWords) {
          if (fromWord.position && toWord.position) {
            connections.push({
              from: {
                position: fromWord.position,
                layer: i,
                poemId: fromPoem.id,
                word: fromWord.text,
              },
              to: {
                position: toWord.position,
                layer: i + 1,
                poemId: toPoem.id,
                word: toWord.text,
              },
              word: fromWord.text.toLowerCase(),
              // Highlight the navigational connections
              isActive:
                connectingWords[`${fromPoem.id}-${toPoem.id}`] ===
                fromWord.text.toLowerCase(),
            });
          }
        }
      }
    }

    return connections;
  }, [visitedPoems, connectingWords]);

  // Mouse/touch interaction for 3D rotation
  const handleMouseDown = (e) => {
    if (e.button !== 0 || isIn2DView) return; // Only handle left mouse button and not in 2D view
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotation.x,
      rotY: rotation.y,
    };
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    // Calculate deltas
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;

    // Horizontal drag (deltaX) rotates around Y axis
    // Vertical drag (deltaY) rotates around X axis
    setRotation({
      x: dragStart.current.rotX + deltaY * 0.5,
      y: dragStart.current.rotY - deltaX * 0.5,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add/remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Zoom with mouse wheel
  const handleWheel = (e) => {
    if (isIn2DView) return; // Don't zoom in 2D view

    e.preventDefault();
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev + 0.1, 2.5));
    } else {
      setScale((prev) => Math.max(prev - 0.1, 0.5));
    }
  };

  // Reset position
  const resetView = () => {
    setScale(1);
    setRotation({ x: 0, y: -12 });
    setPosition({ x: 0, y: 0 });
    setIsIn2DView(false);

    // Reset active layer
    setActiveLayer(null);
  };

  // Navigate to previous/next layer - accounting for reversed order
  const goToPreviousLayer = () => {
    if (activeLayer !== null && activeLayer > 0) {
      setActiveLayer(activeLayer - 1);
    }
  };

  const goToNextLayer = () => {
    if (activeLayer !== null && activeLayer < visitedPoems.length - 1) {
      setActiveLayer(activeLayer + 1);
    }
  };

  // Handle frame click to activate a layer
  const handleFrameClick = (layerIndex) => {
    if (layerIndex === activeLayer) {
      // If already active, switch to 2D view
      setIsIn2DView(true);
    } else {
      // Otherwise just make it active
      setActiveLayer(layerIndex);
    }
  };

  // Handle double-click to immediately go to 2D view
  const handleDoubleClick = (layerIndex) => {
    setActiveLayer(layerIndex);
    setIsIn2DView(true);
  };

  // Return from 2D view to 3D stack
  const returnTo3DView = () => {
    setIsIn2DView(false);
  };

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      resetView();
    }
  }, [isOpen]);

  // Extract highlighted words
  const highlightedWords = wordPool.map((w) =>
    typeof w === "string" ? w.toLowerCase() : w.text.toLowerCase()
  );

  // Calculate shared words map
  const sharedWordsMap = getSharedWordsMap(visitedPoems);

  // Total number of layers for positioning calculation
  const totalLayers = visitedPoems.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-gray-950/95 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 
              backdrop-blur-sm z-20 text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Stats display - only show in 3D view */}
          {!isIn2DView && (
            <div className="absolute top-4 left-4 flex space-x-3 z-20">
              {/* Unique Poems Counter */}
              <div
                className="p-3 bg-gray-900/90 backdrop-blur-sm 
                rounded-lg border border-gray-800 flex items-center gap-2"
              >
                <Book className="w-5 h-5 text-[#2C8C7C]" />
                <div className="text-sm font-medium text-white">
                  Unique Poems Visited: {uniquePoemCount}
                </div>
              </div>

              {/* Constellation Counter */}
              <div
                className="p-3 bg-gray-900/90 backdrop-blur-sm 
                rounded-lg border border-gray-800 flex items-center gap-2"
              >
                <Network className="w-5 h-5 text-[#2C8C7C]" />
                <div className="text-sm font-medium text-white">
                  Constellation Count: {constellationCount}
                </div>
              </div>

              {/* Constellation View Toggle */}
              <div className="relative group flex items-center justify-center">
                <motion.button
                  onClick={() => setShowConstellation(!showConstellation)}
                  className={`p-2 rounded-full ${
                    showConstellation ? "bg-[#2C8C7C]/50" : "bg-gray-900/70"
                  } backdrop-blur-sm 
                    text-white hover:bg-gray-800/70 transition-colors border border-gray-800
                    flex items-center justify-center`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Toggle constellation view"
                >
                  <Telescope className="w-5 h-5 text-[#2C8C7C]" />
                </motion.button>

                {/* Tooltip */}
                <div
                  className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 
                  bg-gray-900/90 backdrop-blur-sm rounded text-xs whitespace-nowrap 
                  text-[#2C8C7C]
                  opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                >
                  Stargazing
                </div>
              </div>

              {/* Help icon */}
              <div className="relative flex items-center ml-2">
                <motion.button
                  onClick={() => setShowHelpModal(true)}
                  className="p-2 rounded-full bg-gray-900/70 backdrop-blur-sm 
                    text-white hover:bg-gray-800/70 transition-colors border border-gray-800
                    flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Constellation mode help"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-[#2C8C7C]"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </motion.button>
              </div>
            </div>
          )}

          {/* Layer Navigation Controls - Only show in 3D view when a layer is active */}
          {!isIn2DView && activeLayer !== null && (
            <>
              <button
                onClick={goToPreviousLayer}
                disabled={activeLayer <= 0}
                className={`absolute left-6 top-1/2 transform -translate-y-1/2 
                  p-3 rounded-full border pointer-events-auto z-20 ${
                    activeLayer <= 0
                      ? "bg-gray-800/40 border-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gray-900/70 border-gray-800 text-white hover:bg-gray-800/70"
                  } transition-colors shadow-lg`}
                aria-label="Previous layer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={goToNextLayer}
                disabled={activeLayer >= visitedPoems.length - 1}
                className={`absolute right-6 top-1/2 transform -translate-y-1/2
                  p-3 rounded-full border pointer-events-auto z-20 ${
                    activeLayer >= visitedPoems.length - 1
                      ? "bg-gray-800/40 border-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gray-900/70 border-gray-800 text-white hover:bg-gray-800/70"
                  } transition-colors shadow-lg`}
                aria-label="Next layer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Back button for 2D view */}
          {isIn2DView && (
            <button
              onClick={returnTo3DView}
              className="absolute top-4 left-1/2 transform -translate-x-1/2
                px-4 py-2 rounded-lg bg-gray-900/70 backdrop-blur-sm 
                border border-gray-800 text-white hover:bg-gray-800/70
                transition-colors shadow-lg z-20 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Stack</span>
            </button>
          )}

          {/* Controls - Only shown in 3D view */}
          {!isIn2DView && (
            <div
              className="absolute top-4 right-20 
              flex space-x-2 z-20"
            >
              <button
                onClick={() => setScale((prev) => Math.min(prev + 0.1, 2.5))}
                className="p-2 rounded-full bg-gray-900/70 backdrop-blur-sm 
                  text-white hover:bg-gray-800/70 transition-colors border border-gray-800"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.5))}
                className="p-2 rounded-full bg-gray-900/70 backdrop-blur-sm 
                  text-white hover:bg-gray-800/70 transition-colors border border-gray-800"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={resetView}
                className="p-2 rounded-full bg-gray-900/70 backdrop-blur-sm 
                  text-white hover:bg-gray-800/70 transition-colors border border-gray-800"
                aria-label="Reset view"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Constellation Help Modal */}
          <AnimatePresence>
            {showHelpModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center 
                  bg-black/40 backdrop-blur-sm p-6"
                onClick={() => setShowHelpModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-[#2C8C7C]/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-medium text-[#2C8C7C] mb-4">
                    Constellation Mode
                  </h3>

                  <div className="space-y-4 text-gray-300 text-sm">
                    <p>
                      <b>Controls</b>
                      <br />• <span className="text-[#2C8C7C]">Drag</span>:
                      Rotate the 3D space
                      <br />•{" "}
                      <span className="text-[#2C8C7C]">Scroll/Buttons</span>:
                      Zoom in and out
                      <br />•{" "}
                      <span className="text-[#2C8C7C]">Click poem border</span>:
                      Focus on a poem layer
                      <br />•{" "}
                      <span className="text-[#2C8C7C]">Double-click</span>:
                      Expand poem to full view
                      <br />•{" "}
                      <span className="text-[#2C8C7C]">Reset button</span>:
                      Return to default view
                      <br />•{" "}
                      <span className="text-[#2C8C7C]">Telescope icon</span>:
                      Toggle stargazing view
                    </p>

                    <p>
                      <b>Star Types</b>
                      <br />•{" "}
                      <span className="text-[#2C8C7C] font-medium">
                        Bright stars
                      </span>
                      : Navigation connections
                      <br />•{" "}
                      <span className="text-[#2C8C7C]/80 font-medium">
                        Medium stars
                      </span>
                      : Shared words from the pool
                      <br />•{" "}
                      <span className="text-[#2C8C7C]/40 font-medium">
                        Dim stars
                      </span>
                      : Other shared words
                    </p>

                    <p>
                      <b>Constellation Count</b>
                      <br />
                      Represents connections made beyond your own poem. Each
                      navigation through a shared word adds a new point to your
                      constellation.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowHelpModal(false)}
                      className="px-4 py-2 bg-[#2C8C7C]/10 hover:bg-[#2C8C7C]/20 
                        text-[#2C8C7C] rounded-lg transition-colors"
                    >
                      Got it
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3D visualization */}
          <div
            ref={containerRef}
            className="absolute inset-0 flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
            style={{
              cursor: isDragging ? "grabbing" : isIn2DView ? "default" : "grab",
              perspective: "1200px",
              perspectiveOrigin: "center",
            }}
          >
            {/* 3D container */}
            <div
              className="relative"
              style={{
                transformStyle: "preserve-3d",
                transform: isIn2DView
                  ? "none"
                  : `
                    translate(${position.x}px, ${position.y}px)
                    scale(${scale})
                    rotateX(${rotation.x}deg) 
                    rotateY(${rotation.y}deg)
                    translateZ(-100px)
                  `,
                transition: isDragging ? "none" : "transform 0.5s ease-out",
                width: isIn2DView ? "100%" : "auto",
                height: isIn2DView ? "100%" : "auto",
              }}
            >
              {/* 3D Stack or 2D View */}
              <div
                className="relative"
                style={{
                  transformStyle: "preserve-3d",
                  width: isIn2DView ? "100%" : 0,
                  height: isIn2DView ? "100%" : 0,
                }}
              >
                {isIn2DView ? (
                  // 2D View - show only active layer
                  visitedPoems
                    .filter((_, index) => index === activeLayer)
                    .map((poem) => (
                      <PoemCanvas
                        key={`2d-view-expanded-${poem.id}-${activeLayer}`}
                        poem={poem}
                        layer={activeLayer}
                        activeLayer={activeLayer}
                        totalLayers={totalLayers}
                        highlightedWords={highlightedWords}
                        connectingWord={
                          activeLayer < visitedPoems.length - 1
                            ? connectingWords[
                                `${poem.id}-${
                                  visitedPoems[activeLayer + 1]?.id
                                }`
                              ]
                            : null
                        }
                        opacity={1}
                        isStacked={false}
                        sharedWordsMap={sharedWordsMap}
                      />
                    ))
                ) : (
                  // 3D Stack View - show all layers
                  <>
                    {visitedPoems.map((poem, index) => (
                      <PoemCanvas
                        key={`stack-layer-${poem.id}-${index}-${activeLayer}`}
                        poem={poem}
                        layer={index}
                        activeLayer={activeLayer}
                        totalLayers={totalLayers}
                        highlightedWords={highlightedWords}
                        connectingWord={
                          index < visitedPoems.length - 1
                            ? connectingWords[
                                `${poem.id}-${visitedPoems[index + 1]?.id}`
                              ]
                            : null
                        }
                        opacity={0.7}
                        onClickFrame={handleFrameClick}
                        onDoubleClick={handleDoubleClick}
                        isStacked={true}
                        sharedWordsMap={sharedWordsMap}
                        constellationMode={showConstellation}
                      />
                    ))}

                    {/* Constellation visualization */}
                    {showConstellation && (
                      <>
                        {/* Star points */}
                        {visitedPoems.map((poem, index) => {
                          if (!poem?.components) return null;

                          return poem.components
                            .filter((comp) => comp.type === "word")
                            .map((word, wordIdx) => {
                              const wordText = word.text.toLowerCase();
                              const isShared = sharedWordsMap.has(wordText);
                              if (!isShared) return null;

                              const isConnectingWord =
                                index < visitedPoems.length - 1 &&
                                connectingWords[
                                  `${poem.id}-${visitedPoems[index + 1]?.id}`
                                ] === wordText;

                              return (
                                <WordNode
                                  key={`star-${poem.id}-${wordIdx}-${word.text}`}
                                  word={word}
                                  layer={index}
                                  currentLayer={activeLayer}
                                  totalLayers={totalLayers}
                                  isHighlighted={false}
                                  isConnecting={isConnectingWord}
                                  isSharedWord={true}
                                  constellationMode={true}
                                  poemIndex={index}
                                />
                              );
                            });
                        })}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NavigationNetwork;
