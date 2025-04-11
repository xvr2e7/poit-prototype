import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Book,
  Network,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// Represents a single word in the 3D poem layer
const WordNode = ({ word, scaleFactor, isHighlighted, isConnecting }) => {
  // Scale position based on scaleFactor to ensure everything fits
  const position = {
    x: (word.position?.x || 0) * scaleFactor,
    y: (word.position?.y || 0) * scaleFactor,
  };

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
        className={`px-2 py-1 rounded-md whitespace-nowrap
          ${
            isConnecting
              ? "bg-[#2C8C7C] text-white shadow-lg"
              : isHighlighted
              ? "bg-[#2C8C7C]/15 text-[#2C8C7C] dark:text-[#2C8C7C]"
              : "text-gray-400/80 dark:text-gray-400/80"
          }`}
        style={{
          fontSize: isConnecting ? "14px" : "12px",
          fontWeight: isConnecting || isHighlighted ? 500 : 400,
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
  currentLayer,
  highlightedWords,
  connectingWord,
  opacity = 1,
  onClick,
}) => {
  if (!poem || !poem.components) return null;

  // Get words from the poem's components
  const words = poem.components.filter((comp) => comp.type === "word");

  // Calculate layer z-position (bottom layer first)
  const Z_POSITION = -220 * (layer - currentLayer);

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
  const isActiveLayer = layer === currentLayer;

  return (
    <div
      className={`absolute ${isActiveLayer ? "z-10" : ""} ${
        onClick ? "cursor-pointer" : ""
      }`}
      style={{
        width: canvasWidth,
        height: canvasHeight,
        left: -canvasWidth / 2,
        top: -canvasHeight / 2,
        transform: `translateZ(${Z_POSITION}px)`,
        transformStyle: "preserve-3d",
        opacity: isActiveLayer ? 1 : opacity,
      }}
      onClick={onClick ? () => onClick(layer) : undefined}
    >
      {/* Layer background */}
      <div
        className={`absolute inset-0 bg-gray-800/90 rounded-xl shadow-lg overflow-hidden
          border-2 transition-all duration-300 ${
            isActiveLayer ? "border-[#2C8C7C]/60" : "border-[#2C8C7C]/10"
          }`}
        style={{ transform: "translateZ(0px)" }}
      >
        {/* Active layer indicator */}
        {isActiveLayer && (
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              boxShadow: "0 0 20px rgba(44, 140, 124, 0.3) inset",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Poem title */}
        <div className="absolute top-4 left-4 p-2">
          <h3 className="text-lg font-medium text-gray-200">{poem.title}</h3>
          <div className="text-xs text-gray-400">{poem.date}</div>
        </div>
      </div>

      {/* Words */}
      {words.map((word, index) => (
        <WordNode
          key={`${poem.id}-word-${index}`}
          word={word}
          scaleFactor={scaleFactor}
          isHighlighted={highlightedWords.includes(word.text.toLowerCase())}
          isConnecting={connectingWord === word.text.toLowerCase()}
        />
      ))}
    </div>
  );
};

// Connection between words on different layers
const WordConnection = ({
  startPosition,
  startLayer,
  endPosition,
  endLayer,
  currentLayer,
  isActive,
}) => {
  // Calculate 3D positions adjusting for current layer
  const startZ = -220 * (startLayer - currentLayer);
  const endZ = -220 * (endLayer - currentLayer);

  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Start point glow */}
      <div
        className="absolute rounded-full"
        style={{
          left: startPosition.x,
          top: startPosition.y,
          width: 6,
          height: 6,
          transform: `translateZ(${startZ}px)`,
          backgroundColor: "#2C8C7C",
          boxShadow: "0 0 8px 2px rgba(44, 140, 124, 0.8)",
          opacity: isActive ? 1 : 0.7,
        }}
      />

      {/* End point glow */}
      <div
        className="absolute rounded-full"
        style={{
          left: endPosition.x,
          top: endPosition.y,
          width: 6,
          height: 6,
          transform: `translateZ(${endZ}px)`,
          backgroundColor: "#2C8C7C",
          boxShadow: "0 0 8px 2px rgba(44, 140, 124, 0.8)",
          opacity: isActive ? 1 : 0.7,
        }}
      />

      {/* Line - using SVG for better 3D connections */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", pointerEvents: "none" }}
      >
        <defs>
          <linearGradient
            id={`gradient-${startLayer}-${endLayer}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              stopColor="#2C8C7C"
              stopOpacity={isActive ? "0.8" : "0.4"}
            />
            <stop offset="100%" stopColor="#2C8C7C" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <line
          x1={startPosition.x}
          y1={startPosition.y}
          x2={endPosition.x}
          y2={endPosition.y}
          stroke={`url(#gradient-${startLayer}-${endLayer})`}
          strokeWidth={isActive ? 1.5 : 1}
          strokeDasharray="5,5"
          style={{
            filter: isActive
              ? "drop-shadow(0 0 2px rgba(44, 140, 124, 0.5))"
              : "none",
          }}
        />
      </svg>
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
  connectingWords = {}, // Map of connections: {`${fromPoemId}-${toPoemId}`: clickedWord}
}) => {
  const containerRef = useRef(null);

  // State for 3D controls
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState({ x: 15, y: 15 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });

  // New state for layer navigation
  const [currentLayer, setCurrentLayer] = useState(0);

  // Enhanced word connections that calculate actual positions
  const wordConnections = useMemo(() => {
    if (!visitedPoems || visitedPoems.length < 2) return [];

    const connections = [];

    // Process each poem-to-poem connection
    for (let i = 0; i < visitedPoems.length - 1; i++) {
      const fromPoem = visitedPoems[i];
      const toPoem = visitedPoems[i + 1];

      if (!fromPoem || !toPoem) continue;

      // Get the connecting word
      const connectionKey = `${fromPoem.id}-${toPoem.id}`;
      const connectingWord = connectingWords[connectionKey];

      if (!connectingWord) continue;

      // Find this word in both poems
      const fromComponent = fromPoem.components?.find(
        (comp) =>
          comp.type === "word" &&
          comp.text.toLowerCase() === connectingWord.toLowerCase()
      );

      const toComponent = toPoem.components?.find(
        (comp) =>
          comp.type === "word" &&
          comp.text.toLowerCase() === connectingWord.toLowerCase()
      );

      if (fromComponent?.position && toComponent?.position) {
        connections.push({
          from: {
            position: fromComponent.position,
            layer: i,
            poemId: fromPoem.id,
          },
          to: {
            position: toComponent.position,
            layer: i + 1,
            poemId: toPoem.id,
          },
          word: connectingWord,
          isActive: i === visitedPoems.length - 2, // Most recent connection
        });
      }
    }

    return connections;
  }, [visitedPoems, connectingWords]);

  // Improved handling for touchpad-friendly 3D interaction
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only handle left mouse button
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
    setRotation({ x: 15, y: 15 });
    setPosition({ x: 0, y: 0 });

    // Find index of current poem and focus on that layer
    const currentPoemIndex = visitedPoems.findIndex(
      (p) => p.id === currentPoemId
    );
    if (currentPoemIndex !== -1) {
      setCurrentLayer(currentPoemIndex);
    } else {
      setCurrentLayer(0);
    }
  };

  // Navigate to previous/next layer
  const goToPreviousLayer = () => {
    if (currentLayer > 0) {
      setCurrentLayer(currentLayer - 1);
    }
  };

  const goToNextLayer = () => {
    if (currentLayer < visitedPoems.length - 1) {
      setCurrentLayer(currentLayer + 1);
    }
  };

  // Handle layer click
  const handleLayerClick = (layerIndex) => {
    setCurrentLayer(layerIndex);
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
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 
              backdrop-blur-sm z-20 text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Stats display */}
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
          </div>

          {/* Layer Navigation Controls */}
          <div
            className="absolute left-1/2 top-4 transform -translate-x-1/2 
            flex items-center gap-4 z-20"
          >
            <button
              onClick={goToPreviousLayer}
              disabled={currentLayer <= 0}
              className={`p-2 rounded-full border ${
                currentLayer <= 0
                  ? "bg-gray-800/40 border-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-900/70 border-gray-800 text-white hover:bg-gray-800/70"
              } transition-colors`}
              aria-label="Previous layer"
            >
              <ChevronUp className="w-5 h-5" />
            </button>

            <div
              className="px-4 py-1.5 bg-gray-900/70 backdrop-blur-sm 
              rounded-lg border border-gray-800 text-white"
            >
              Layer {currentLayer + 1} of {visitedPoems.length}
            </div>

            <button
              onClick={goToNextLayer}
              disabled={currentLayer >= visitedPoems.length - 1}
              className={`p-2 rounded-full border ${
                currentLayer >= visitedPoems.length - 1
                  ? "bg-gray-800/40 border-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-900/70 border-gray-800 text-white hover:bg-gray-800/70"
              } transition-colors`}
              aria-label="Next layer"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Controls */}
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

          {/* Instructions */}
          <div
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
            bg-gray-900/80 backdrop-blur-sm rounded-lg px-4 py-2 z-20 text-white text-sm
            border border-gray-800"
          >
            Drag to rotate • Scroll to zoom • Click layer to focus
          </div>

          {/* 3D visualization */}
          <div
            ref={containerRef}
            className="absolute inset-0 flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              perspective: "1200px",
              perspectiveOrigin: "center",
            }}
          >
            {/* 3D container */}
            <div
              className="relative"
              style={{
                transformStyle: "preserve-3d",
                transform: `
                  translate(${position.x}px, ${position.y}px)
                  scale(${scale})
                  rotateX(${rotation.x}deg) 
                  rotateY(${rotation.y}deg)
                `,
                transition: isDragging ? "none" : "transform 0.3s ease-out",
              }}
            >
              {/* Poem layers */}
              <div
                className="relative w-0 h-0"
                style={{
                  transformStyle: "preserve-3d",
                }}
              >
                {visitedPoems.map((poem, index) => (
                  <PoemCanvas
                    key={`poem-layer-${poem.id}-${index}`}
                    poem={poem}
                    layer={index}
                    currentLayer={currentLayer}
                    highlightedWords={highlightedWords}
                    connectingWord={
                      index < visitedPoems.length - 1
                        ? connectingWords[
                            `${poem.id}-${visitedPoems[index + 1]?.id}`
                          ]
                        : null
                    }
                    opacity={0.7}
                    onClick={handleLayerClick}
                  />
                ))}

                {/* Connections between words */}
                {wordConnections.map((connection, idx) => (
                  <WordConnection
                    key={`connection-${idx}`}
                    startPosition={connection.from.position}
                    startLayer={connection.from.layer}
                    endPosition={connection.to.position}
                    endLayer={connection.to.layer}
                    currentLayer={currentLayer}
                    isActive={connection.isActive}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NavigationNetwork;
