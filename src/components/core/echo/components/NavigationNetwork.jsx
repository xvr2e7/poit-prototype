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
  totalLayers,
  highlightedWords,
  connectingWord,
  opacity = 1,
  onClick,
  onDoubleClick,
  isStacked = true,
}) => {
  if (!poem || !poem.components) return null;

  // Get words from the poem's components
  const words = poem.components.filter((comp) => comp.type === "word");

  // Calculate position in stack
  const reversedLayer = isStacked ? totalLayers - 1 - layer : layer;
  const reversedCurrentLayer = isStacked
    ? totalLayers - 1 - currentLayer
    : currentLayer;
  const offsetFromCurrent = reversedLayer - reversedCurrentLayer;

  // Calculate stack offset for tilted view
  const horizontalOffset = isStacked ? offsetFromCurrent * 40 : 0;
  const verticalOffset = isStacked ? offsetFromCurrent * 20 : 0;

  // Calculate z-index and z-position for stacked view
  const zOffset = isStacked ? -120 * offsetFromCurrent : 0;
  const zIndex = isStacked ? 100 - Math.abs(offsetFromCurrent) : 100;

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

  // Transform style for layers in the stack
  const layerTransform = isStacked
    ? `translateX(${horizontalOffset}px) translateY(${verticalOffset}px) translateZ(${zOffset}px) rotateY(-15deg)`
    : "translateZ(0px)";

  // Scale and size for 2D view (when not stacked)
  const layerScale = isStacked ? 1 : 1.5;
  const layerSize = isStacked
    ? { width: canvasWidth, height: canvasHeight }
    : { width: "100%", height: "100%" };

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
      onClick={onClick ? () => onClick(layer) : undefined}
      onDoubleClick={onDoubleClick ? () => onDoubleClick(layer) : undefined}
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
          key={`${poem.id}-word-${index}-${word.text}`}
          word={word}
          scaleFactor={scaleFactor * layerScale}
          isHighlighted={highlightedWords.includes(word.text.toLowerCase())}
          isConnecting={connectingWord === word.text.toLowerCase()}
        />
      ))}
    </div>
  );
};

// Connection between words on different layers - laser beam style
const LaserBeamConnection = ({
  startPosition,
  startLayer,
  endPosition,
  endLayer,
  currentLayer,
  totalLayers,
  isActive,
}) => {
  // Calculate 3D positions with offsets for the stacked view
  const reversedStartLayer = totalLayers - 1 - startLayer;
  const reversedEndLayer = totalLayers - 1 - endLayer;
  const reversedCurrentLayer = totalLayers - 1 - currentLayer;

  const startHOffset = (reversedStartLayer - reversedCurrentLayer) * 40;
  const startVOffset = (reversedStartLayer - reversedCurrentLayer) * 20;
  const startZ = -120 * (reversedStartLayer - reversedCurrentLayer);

  const endHOffset = (reversedEndLayer - reversedCurrentLayer) * 40;
  const endVOffset = (reversedEndLayer - reversedCurrentLayer) * 20;
  const endZ = -120 * (reversedEndLayer - reversedCurrentLayer);

  // Adjusted positions for stack view
  const adjustedStartPos = {
    x: startPosition.x + startHOffset,
    y: startPosition.y + startVOffset,
  };

  const adjustedEndPos = {
    x: endPosition.x + endHOffset,
    y: endPosition.y + endVOffset,
  };

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
          left: adjustedStartPos.x,
          top: adjustedStartPos.y,
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
          left: adjustedEndPos.x,
          top: adjustedEndPos.y,
          width: 6,
          height: 6,
          transform: `translateZ(${endZ}px)`,
          backgroundColor: "#2C8C7C",
          boxShadow: "0 0 8px 2px rgba(44, 140, 124, 0.8)",
          opacity: isActive ? 1 : 0.7,
        }}
      />

      {/* Laser beam connection - using SVG for better rendering */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", pointerEvents: "none" }}
      >
        <defs>
          <linearGradient
            id={`laser-gradient-${startLayer}-${endLayer}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#2C8C7C" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#2C8C7C" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2C8C7C" stopOpacity="0.9" />
          </linearGradient>
          <filter
            id={`laser-glow-${startLayer}-${endLayer}`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite
              in="SourceGraphic"
              in2="blur"
              operator="over"
              result="glow"
            />
          </filter>
        </defs>
        <line
          x1={adjustedStartPos.x}
          y1={adjustedStartPos.y}
          x2={adjustedEndPos.x}
          y2={adjustedEndPos.y}
          stroke={`url(#laser-gradient-${startLayer}-${endLayer})`}
          strokeWidth={isActive ? 2 : 1.5}
          style={{
            filter: `url(#laser-glow-${startLayer}-${endLayer})`,
            opacity: isActive ? 1 : 0.7,
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
  const [rotation, setRotation] = useState({ x: 25, y: -30 }); // Match the tilted view in reference image
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });

  // Layer navigation state
  const [currentLayer, setCurrentLayer] = useState(0);

  // New state for 2D view mode
  const [activeLayer, setActiveLayer] = useState(null);
  const [isIn2DView, setIsIn2DView] = useState(false);

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
    setRotation({ x: 25, y: -30 }); // Adjusted to match the reference image
    setPosition({ x: 0, y: 0 });
    setIsIn2DView(false);
    setActiveLayer(null);

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

  // Navigate to previous/next layer - accounting for reversed order
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

  // Handle double-click to enter 2D view
  const handleDoubleClick = (layerIndex) => {
    setActiveLayer(layerIndex);
    setIsIn2DView(true);
  };

  // Return from 2D view to 3D stack
  const returnTo3DView = () => {
    setIsIn2DView(false);
    setCurrentLayer(activeLayer || 0);
    setActiveLayer(null);
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

          {/* Layer Navigation Controls - Only show in 3D view */}
          {!isIn2DView && (
            <>
              <button
                onClick={goToPreviousLayer}
                disabled={currentLayer <= 0}
                className={`absolute left-6 top-1/2 transform -translate-y-1/2 
                  p-3 rounded-full border pointer-events-auto z-20 ${
                    currentLayer <= 0
                      ? "bg-gray-800/40 border-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gray-900/70 border-gray-800 text-white hover:bg-gray-800/70"
                  } transition-colors shadow-lg`}
                aria-label="Previous layer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={goToNextLayer}
                disabled={currentLayer >= visitedPoems.length - 1}
                className={`absolute right-6 top-1/2 transform -translate-y-1/2
                  p-3 rounded-full border pointer-events-auto z-20 ${
                    currentLayer >= visitedPoems.length - 1
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

          {/* Instructions */}
          <div
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
            bg-gray-900/80 backdrop-blur-sm rounded-lg px-4 py-2 z-20 text-white text-sm
            border border-gray-800"
          >
            {isIn2DView
              ? "Click 'Back to Stack' to return to 3D view"
              : "Double-click a layer to expand • Use arrows to navigate • Drag to rotate"}
          </div>

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
                        currentLayer={activeLayer}
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
                      />
                    ))
                ) : (
                  // 3D Stack View - show all layers
                  <>
                    {visitedPoems.map((poem, index) => (
                      <PoemCanvas
                        key={`stack-layer-${poem.id}-${index}-${currentLayer}`}
                        poem={poem}
                        layer={index}
                        currentLayer={currentLayer}
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
                        onClick={() => setCurrentLayer(index)}
                        onDoubleClick={handleDoubleClick}
                        isStacked={true}
                      />
                    ))}

                    {/* Laser beam connections between adjacent layers */}
                    {wordConnections.map((connection, idx) => (
                      <LaserBeamConnection
                        key={`connection-${connection.from.poemId}-${connection.to.poemId}-${idx}-${currentLayer}`}
                        startPosition={connection.from.position}
                        startLayer={connection.from.layer}
                        endPosition={connection.to.position}
                        endLayer={connection.to.layer}
                        currentLayer={currentLayer}
                        totalLayers={totalLayers}
                        isActive={connection.isActive}
                      />
                    ))}
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
