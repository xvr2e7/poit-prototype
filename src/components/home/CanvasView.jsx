import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Type,
  PenTool,
  Hash,
  Grid,
  RotateCcw,
  BookMarked,
  ZoomIn,
  ZoomOut,
  Pencil,
} from "lucide-react";

const CanvasView = ({ onBack, words, onSavePoem }) => {
  // CANVAS WORDS STATE
  const [canvasWords, setCanvasWords] = useState([]);
  const [selectedWordId, setSelectedWordId] = useState(null);
  const [poemTitle, setPoemTitle] = useState("My Poem");

  // TOOL PANELS STATE
  const [activePanel, setActivePanel] = useState(null);
  const [canvasPattern, setCanvasPattern] = useState("blank");
  const [showPreview, setShowPreview] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // DOM REFS
  const canvasRef = useRef(null);
  const wordsRef = useRef({});

  // ZOOM AND PAN STATE
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  // COMMON WORDS WITH CATEGORIES
  const commonWords = [
    { word: "I", category: "Pronouns" },
    { word: "you", category: "Pronouns" },
    { word: "he", category: "Pronouns" },
    { word: "she", category: "Pronouns" },
    { word: "it", category: "Pronouns" },
    { word: "we", category: "Pronouns" },
    { word: "they", category: "Pronouns" },
    { word: "and", category: "Connectors" },
    { word: "but", category: "Connectors" },
    { word: "or", category: "Connectors" },
    { word: "yet", category: "Connectors" },
    { word: "so", category: "Connectors" },
    { word: "for", category: "Prepositions" },
    { word: "in", category: "Prepositions" },
    { word: "by", category: "Prepositions" },
    { word: "with", category: "Prepositions" },
    { word: "of", category: "Prepositions" },
    { word: "to", category: "Prepositions" },
    { word: "the", category: "Articles" },
    { word: "a", category: "Articles" },
    { word: "an", category: "Articles" },
  ];

  const categories = [...new Set(commonWords.map((w) => w.category))];

  // Initialize canvas with words
  useEffect(() => {
    const initialWords = words.map((word) => ({
      id: `word-${Math.random().toString(36).substr(2, 9)}`,
      text: word,
      type: "word",
      position: {
        x: Math.random() * (window.innerWidth - 300) + 150,
        y: Math.random() * (window.innerHeight - 300) + 150,
      },
    }));
    setCanvasWords(initialWords);
  }, [words]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        showPreview ||
        showResetConfirm ||
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA"
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      switch (key) {
        case "c":
          if (selectedWordId) {
            handleCapitalizationChange();
          }
          break;
        case "p":
          togglePanel(activePanel === "punctuation" ? null : "punctuation");
          break;
        case "f":
          togglePanel(activePanel === "common" ? null : "common");
          break;
        case "b":
          togglePanel(activePanel === "canvas" ? null : "canvas");
          break;
        case "r":
          setShowResetConfirm(true);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedWordId, activePanel, showPreview, showResetConfirm]);

  // WORD MANIPULATION HANDLERS
  const handleWordSelect = (wordId) => {
    setSelectedWordId((prevId) => (prevId === wordId ? null : wordId));
  };

  const startDrag = (e, wordId) => {
    // Skip if already dragging or in preview mode
    if (e.currentTarget.dataset.dragging === "true" || showPreview) return;

    const wordElement = e.currentTarget;
    const word = canvasWords.find((w) => w.id === wordId);
    if (!word) return;

    // Select the word
    handleWordSelect(wordId);

    // Mark as dragging
    wordElement.dataset.dragging = "true";

    // Record initial position
    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const wordBounds = wordElement.getBoundingClientRect();

    const offsetX = e.clientX - wordBounds.left;
    const offsetY = e.clientY - wordBounds.top;

    // Add temporary handlers to document for drag/drop
    const handleMove = (moveEvent) => {
      if (wordElement.dataset.dragging !== "true") return;

      const x =
        (moveEvent.clientX - canvasBounds.left - offsetX) / zoomLevel -
        panOffset.x;
      const y =
        (moveEvent.clientY - canvasBounds.top - offsetY) / zoomLevel -
        panOffset.y;

      // Apply constraints to keep word inside canvas
      const maxX = canvasBounds.width - wordBounds.width;
      const maxY = canvasBounds.height - wordBounds.height;

      const boundedX = Math.max(0, Math.min(maxX, x));
      const boundedY = Math.max(0, Math.min(maxY, y));

      // Update word position in state
      setCanvasWords((prev) =>
        prev.map((w) =>
          w.id === wordId ? { ...w, position: { x: boundedX, y: boundedY } } : w
        )
      );
    };

    const handleUp = () => {
      if (wordElement.dataset.dragging !== "true") return;

      // End drag
      wordElement.dataset.dragging = "false";

      // Remove temporary handlers
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleUp);
    };

    // Add temporary handlers
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    document.addEventListener("touchmove", handleMove);
    document.addEventListener("touchend", handleUp);
  };

  // Handle double-click to remove word from canvas
  const handleDoubleClick = (e, wordId) => {
    e.preventDefault();
    const word = canvasWords.find((w) => w.id === wordId);
    if (!word) return;

    setCanvasWords((words) => words.filter((w) => w.id !== wordId));
    if (selectedWordId === wordId) {
      setSelectedWordId(null);
    }
  };

  // TOOLBAR ACTIONS
  const togglePanel = (panelName) => {
    setActivePanel((prev) => (prev === panelName ? null : panelName));
  };

  const handleCapitalizationChange = () => {
    if (!selectedWordId) return;

    setCanvasWords((prev) =>
      prev.map((word) => {
        if (word.id === selectedWordId && word.type === "word") {
          const nextState = {
            none: "first",
            first: "all",
            all: "none",
          }[word.capitalization || "none"];

          return {
            ...word,
            capitalization: nextState,
          };
        }
        return word;
      })
    );
  };

  const handlePunctuationSelect = (item) => {
    // Add punctuation to canvas
    const newItem = {
      ...item,
      id: `${item.type}-${Date.now()}`,
      position: {
        x: Math.random() * 200 + 50,
        y: Math.random() * 200 + 50,
      },
    };

    setCanvasWords((prev) => [...prev, newItem]);
    setActivePanel(null);
  };

  // CANVAS PAN AND ZOOM
  const handleCanvasMouseDown = (e) => {
    // Only middle mouse button (wheel) or when holding space
    if (e.button === 1 || (e.button === 0 && e.getModifierState("Space"))) {
      setIsPanning(true);
      panStart.current = {
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      };
      e.preventDefault();
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isPanning) return;

    const newOffset = {
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y,
    };

    setPanOffset(newOffset);
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  // Add mouse event handlers for canvas panning
  useEffect(() => {
    if (isPanning) {
      document.addEventListener("mousemove", handleCanvasMouseMove);
      document.addEventListener("mouseup", handleCanvasMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleCanvasMouseMove);
      document.removeEventListener("mouseup", handleCanvasMouseUp);
    };
  }, [isPanning]);

  // Handle wheel zoom
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel((prev) => Math.max(0.5, Math.min(2.5, prev + delta)));
    }
  };

  // Reset canvas
  const resetCanvas = () => {
    setCanvasWords([]);
    setSelectedWordId(null);
    setShowResetConfirm(false);
  };

  // Get display text based on capitalization
  const getDisplayText = (word) => {
    const text = word.text || word.content;
    if (word.type === "punctuation") return text;

    switch (word.capitalization) {
      case "first":
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
      case "all":
        return text.toUpperCase();
      default:
        return text;
    }
  };

  // HANDLE SAVING THE POEM
  const handleSavePoem = () => {
    onSavePoem({
      title: poemTitle,
      components: canvasWords,
      type: "digital_collage",
      date: new Date().toLocaleDateString(),
    });
    onBack();
  };

  // CANVAS BACKGROUND PATTERNS
  const getCanvasBackground = () => {
    switch (canvasPattern) {
      case "grid":
        return {
          backgroundImage:
            "linear-gradient(to right, rgba(44, 140, 124, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(44, 140, 124, 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        };
      case "dots":
        return {
          backgroundImage:
            "radial-gradient(rgba(44, 140, 124, 0.1) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        };
      case "waves":
        // Waves will be added as an SVG element
        return {};
      default:
        return {};
    }
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#2C8C7C]/20 flex justify-between items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="flex-1">
          <input
            type="text"
            value={poemTitle}
            onChange={(e) => setPoemTitle(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-transparent border-b border-[#2C8C7C]/40 
              text-gray-800 dark:text-white text-lg font-medium
              focus:outline-none focus:border-[#2C8C7C]"
            placeholder="Enter poem title..."
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setZoomLevel((prev) => Math.max(0.5, prev - 0.1))}
              className="p-1.5 rounded-full bg-white/10 dark:bg-gray-900/30 
                backdrop-blur-sm border border-[#2C8C7C]/20 hover:bg-white/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ZoomOut className="w-4 h-4 text-[#2C8C7C]" />
            </motion.button>

            <span className="text-xs px-2 py-1 rounded bg-white/10 dark:bg-gray-900/20 text-[#2C8C7C]">
              {Math.round(zoomLevel * 100)}%
            </span>

            <motion.button
              onClick={() => setZoomLevel((prev) => Math.min(2.5, prev + 0.1))}
              className="p-1.5 rounded-full bg-white/10 dark:bg-gray-900/30 
                backdrop-blur-sm border border-[#2C8C7C]/20 hover:bg-white/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ZoomIn className="w-4 h-4 text-[#2C8C7C]" />
            </motion.button>
          </div>

          <motion.button
            onClick={() => setShowPreview(true)}
            className="px-4 py-1.5 rounded-lg bg-[#2C8C7C]/10 
              hover:bg-[#2C8C7C]/20 text-[#2C8C7C] transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Preview
          </motion.button>

          <motion.button
            onClick={handleSavePoem}
            className="px-4 py-1.5 rounded-lg bg-[#2C8C7C] 
              hover:bg-[#2C8C7C]/90 text-white transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Save Poem
          </motion.button>

          <motion.button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-[#2C8C7C]/10 text-[#2C8C7C]"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div className="flex flex-1 relative">
        {/* Left Toolbar */}
        <div className="relative">
          <div
            className="h-full w-20 backdrop-blur-md bg-white/5 dark:bg-gray-900/5 
            border-r border-[#2C8C7C]/10 flex flex-col"
          >
            <div className="h-full p-4 flex flex-col">
              {/* Main tools */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex flex-col gap-5">
                  <motion.button
                    onClick={handleCapitalizationChange}
                    className="p-3 rounded-xl bg-white/5 hover:bg-[#2C8C7C]/10 
                      border border-[#2C8C7C]/30 transition-all duration-300
                      group relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!selectedWordId}
                  >
                    <Type className="w-5 h-5 text-[#2C8C7C]/70 group-hover:text-[#2C8C7C]" />
                    <div
                      className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
                      bg-white dark:bg-gray-950 border border-[#2C8C7C]/20 rounded-lg
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                      pointer-events-none px-3 py-2 shadow-lg z-10"
                    >
                      <span className="text-sm text-[#2C8C7C] whitespace-nowrap font-medium">
                        Capitalization (C)
                      </span>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => togglePanel("punctuation")}
                    className="p-3 rounded-xl bg-white/5 hover:bg-[#2C8C7C]/10 
                      border border-[#2C8C7C]/30 transition-all duration-300
                      group relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PenTool className="w-5 h-5 text-[#2C8C7C]/70 group-hover:text-[#2C8C7C]" />
                    <div
                      className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
                      bg-white dark:bg-gray-950 border border-[#2C8C7C]/20 rounded-lg
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                      pointer-events-none px-3 py-2 shadow-lg z-10"
                    >
                      <span className="text-sm text-[#2C8C7C] whitespace-nowrap font-medium">
                        Punctuation (P)
                      </span>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => togglePanel("common")}
                    className="p-3 rounded-xl bg-white/5 hover:bg-[#2C8C7C]/10 
                      border border-[#2C8C7C]/30 transition-all duration-300
                      group relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Hash className="w-5 h-5 text-[#2C8C7C]/70 group-hover:text-[#2C8C7C]" />
                    <div
                      className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
                      bg-white dark:bg-gray-950 border border-[#2C8C7C]/20 rounded-lg
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                      pointer-events-none px-3 py-2 shadow-lg z-10"
                    >
                      <span className="text-sm text-[#2C8C7C] whitespace-nowrap font-medium">
                        Common Words (F)
                      </span>
                    </div>
                  </motion.button>

                  {/* Canvas Pattern Tool */}
                  <motion.button
                    onClick={() => togglePanel("canvas")}
                    className="p-3 rounded-xl bg-white/5 hover:bg-[#2C8C7C]/10 
                      border border-[#2C8C7C]/30 transition-all duration-300
                      group relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Grid className="w-5 h-5 text-[#2C8C7C]/70 group-hover:text-[#2C8C7C]" />
                    <div
                      className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
                      bg-white dark:bg-gray-950 border border-[#2C8C7C]/20 rounded-lg
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                      pointer-events-none px-3 py-2 shadow-lg z-10"
                    >
                      <span className="text-sm text-[#2C8C7C] whitespace-nowrap font-medium">
                        Canvas Pattern (B)
                      </span>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* Action Tools */}
              <div>
                <div className="w-full h-px bg-[#2C8C7C]/10 mb-3" />

                <motion.button
                  onClick={() => setShowResetConfirm(true)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-[#2C8C7C]/10 
                    border border-[#2C8C7C]/30 transition-all duration-300
                    group relative mb-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw className="w-5 h-5 text-[#2C8C7C]/70 group-hover:text-[#2C8C7C]" />
                  <div
                    className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
                    bg-white dark:bg-gray-950 border border-[#2C8C7C]/20 rounded-lg
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                    pointer-events-none px-3 py-2 shadow-lg z-10"
                  >
                    <span className="text-sm text-[#2C8C7C] whitespace-nowrap font-medium">
                      Reset Canvas (R)
                    </span>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => setShowPreview(true)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-[#2C8C7C]/10 
                    border border-[#2C8C7C]/30 transition-all duration-300
                    group relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BookMarked className="w-5 h-5 text-[#2C8C7C]/70 group-hover:text-[#2C8C7C]" />
                  <div
                    className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
                    bg-white dark:bg-gray-950 border border-[#2C8C7C]/20 rounded-lg
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                    pointer-events-none px-3 py-2 shadow-lg z-10"
                  >
                    <span className="text-sm text-[#2C8C7C] whitespace-nowrap font-medium">
                      Preview Poem
                    </span>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden"
          style={getCanvasBackground()}
          onMouseDown={handleCanvasMouseDown}
          onWheel={handleWheel}
        >
          {/* Instruction text */}
          <div
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 
            text-xs text-gray-500 bg-white/50 dark:bg-black/30 px-2 py-1 rounded-full
            pointer-events-none backdrop-blur-sm"
          >
            Drag to move words • Double-click to remove • Ctrl+Wheel to zoom •
            Hold Space and drag to pan
          </div>

          {/* Waves pattern */}
          {canvasPattern === "waves" && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <svg className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <pattern
                    id="wave-pattern"
                    x="0"
                    y="0"
                    width="200"
                    height="200"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M0,50 C20,40 30,60 50,50 C70,40 80,60 100,50 C120,40 130,60 150,50 C170,40 180,60 200,50"
                      fill="none"
                      stroke="rgba(44, 140, 124, 0.05)"
                      strokeWidth="1"
                      className="dark:stroke-[rgba(44,140,124,0.1)]"
                    />
                    <path
                      d="M0,100 C20,90 30,110 50,100 C70,90 80,110 100,100 C120,90 130,110 150,100 C170,90 180,110 200,100"
                      fill="none"
                      stroke="rgba(44, 140, 124, 0.05)"
                      strokeWidth="1"
                      className="dark:stroke-[rgba(44,140,124,0.1)]"
                    />
                    <path
                      d="M0,150 C20,140 30,160 50,150 C70,140 80,160 100,150 C120,140 130,160 150,150 C170,140 180,160 200,150"
                      fill="none"
                      stroke="rgba(44, 140, 124, 0.05)"
                      strokeWidth="1"
                      className="dark:stroke-[rgba(44,140,124,0.1)]"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#wave-pattern)" />
              </svg>
            </div>
          )}

          {/* Words on Canvas */}
          <div
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              transformOrigin: "top left",
              transition: isPanning ? "none" : "transform 0.1s ease-out",
            }}
            className="absolute inset-0"
          >
            {canvasWords.map((word) => (
              <motion.div
                key={word.id}
                ref={(el) => (wordsRef.current[word.id] = el)}
                data-dragging="false"
                className="absolute select-none cursor-move"
                style={{
                  left: word.position?.x || 0,
                  top: word.position?.y || 0,
                  zIndex: 10,
                  touchAction: "none",
                }}
                onMouseDown={(e) => startDrag(e, word.id)}
                onTouchStart={(e) => startDrag(e, word.id)}
                onDoubleClick={(e) => handleDoubleClick(e, word.id)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                {/* Word Container */}
                <div
                  className={`
                    relative px-4 py-2 rounded-lg
                    backdrop-blur-sm transition-all
                    ${
                      selectedWordId === word.id
                        ? "bg-[#2C8C7C]/15 outline outline-2 outline-[#2C8C7C]"
                        : "bg-white/10"
                    }
                  `}
                >
                  <span className="text-[#2C8C7C] font-medium">
                    {getDisplayText(word)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tool Panels */}
        <AnimatePresence>
          {/* Common Words Panel */}
          {activePanel === "common" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="fixed right-28 top-8 bg-white dark:bg-gray-950 
                rounded-lg border border-[#2C8C7C]/20 shadow-lg
                z-50"
            >
              <div className="flex items-center justify-between p-3 border-b border-[#2C8C7C]/10">
                <h3 className="text-[#2C8C7C] font-medium">Common Words</h3>
                <button
                  onClick={() => setActivePanel(null)}
                  className="p-1 rounded-lg hover:bg-[#2C8C7C]/10 text-[#2C8C7C]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3">
                <div className="w-96 space-y-4">
                  {categories.map((category) => (
                    <div key={category}>
                      <h4 className="text-[#2C8C7C]/70 text-sm mb-2">
                        {category}
                      </h4>
                      <div className="grid grid-cols-4 gap-2">
                        {commonWords
                          .filter((w) => w.category === category)
                          .map(({ word }) => (
                            <motion.button
                              key={word}
                              onClick={() =>
                                handlePunctuationSelect({
                                  text: word,
                                  type: "word",
                                })
                              }
                              className="px-2 py-1.5 rounded-lg text-sm hover:bg-[#2C8C7C]/10 
                                text-[#2C8C7C] text-center transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {word}
                            </motion.button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Punctuation Panel */}
          {activePanel === "punctuation" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="fixed right-28 top-8 bg-white dark:bg-gray-950 
                rounded-lg border border-[#2C8C7C]/20 shadow-lg
                z-50"
            >
              <div className="flex items-center justify-between p-3 border-b border-[#2C8C7C]/10">
                <h3 className="text-[#2C8C7C] font-medium">Add Punctuation</h3>
                <button
                  onClick={() => setActivePanel(null)}
                  className="p-1 rounded-lg hover:bg-[#2C8C7C]/10 text-[#2C8C7C]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-2 gap-2 w-48">
                  {[
                    { symbol: ".", label: "Period" },
                    { symbol: ",", label: "Comma" },
                    { symbol: ";", label: "Semicolon" },
                    { symbol: ":", label: "Colon" },
                    { symbol: "—", label: "Em dash" },
                    { symbol: "?", label: "Question mark" },
                    { symbol: "!", label: "Exclamation" },
                  ].map(({ symbol, label }) => (
                    <motion.button
                      key={symbol}
                      onClick={() =>
                        handlePunctuationSelect({
                          text: symbol,
                          type: "punctuation",
                        })
                      }
                      className="p-2 rounded-lg hover:bg-[#2C8C7C]/10 
                        text-[#2C8C7C] text-center transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-lg font-medium">{symbol}</div>
                      <div className="text-xs opacity-70">{label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Canvas Pattern Panel */}
          {activePanel === "canvas" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="fixed right-28 top-8 bg-white dark:bg-gray-950 
                rounded-lg border border-[#2C8C7C]/20 shadow-lg
                z-50"
            >
              <div className="flex items-center justify-between p-3 border-b border-[#2C8C7C]/10">
                <h3 className="text-[#2C8C7C] font-medium">
                  Canvas Background
                </h3>
                <button
                  onClick={() => setActivePanel(null)}
                  className="p-1 rounded-lg hover:bg-[#2C8C7C]/10 text-[#2C8C7C]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-2 gap-3 w-64">
                  <motion.button
                    onClick={() => {
                      setCanvasPattern("blank");
                      setActivePanel(null);
                    }}
                    className={`p-3 rounded-lg hover:bg-[#2C8C7C]/10 
                      text-[#2C8C7C] text-center transition-colors border
                      ${
                        canvasPattern === "blank"
                          ? "border-[#2C8C7C]"
                          : "border-[#2C8C7C]/20"
                      }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="w-full h-16 bg-white dark:bg-gray-800 rounded-md mb-2"></div>
                    <div className="text-sm">Blank</div>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setCanvasPattern("grid");
                      setActivePanel(null);
                    }}
                    className={`p-3 rounded-lg hover:bg-[#2C8C7C]/10 
                      text-[#2C8C7C] text-center transition-colors border
                      ${
                        canvasPattern === "grid"
                          ? "border-[#2C8C7C]"
                          : "border-[#2C8C7C]/20"
                      }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="w-full h-16 bg-white dark:bg-gray-800 rounded-md mb-2 relative overflow-hidden">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            "linear-gradient(to right, rgba(44, 140, 124, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(44, 140, 124, 0.1) 1px, transparent 1px)",
                          backgroundSize: "8px 8px",
                        }}
                      ></div>
                    </div>
                    <div className="text-sm">Grid</div>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setCanvasPattern("dots");
                      setActivePanel(null);
                    }}
                    className={`p-3 rounded-lg hover:bg-[#2C8C7C]/10 
                      text-[#2C8C7C] text-center transition-colors border
                      ${
                        canvasPattern === "dots"
                          ? "border-[#2C8C7C]"
                          : "border-[#2C8C7C]/20"
                      }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="w-full h-16 bg-white dark:bg-gray-800 rounded-md mb-2 relative overflow-hidden">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            "radial-gradient(rgba(44, 140, 124, 0.1) 1px, transparent 1px)",
                          backgroundSize: "8px 8px",
                        }}
                      ></div>
                    </div>
                    <div className="text-sm">Dots</div>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setCanvasPattern("waves");
                      setActivePanel(null);
                    }}
                    className={`p-3 rounded-lg hover:bg-[#2C8C7C]/10 
                      text-[#2C8C7C] text-center transition-colors border
                      ${
                        canvasPattern === "waves"
                          ? "border-[#2C8C7C]"
                          : "border-[#2C8C7C]/20"
                      }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="w-full h-16 bg-white dark:bg-gray-800 rounded-md mb-2 relative overflow-hidden">
                      <svg
                        className="absolute inset-0 w-full h-full"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M0,20 C10,15 15,25 25,20 C35,15 40,25 50,20 C60,15 65,25 75,20 C85,15 90,25 100,20"
                          fill="none"
                          stroke="rgba(44, 140, 124, 0.1)"
                          strokeWidth="1"
                        />
                        <path
                          d="M0,40 C10,35 15,45 25,40 C35,35 40,45 50,40 C60,35 65,45 75,40 C85,35 90,45 100,40"
                          fill="none"
                          stroke="rgba(44, 140, 124, 0.1)"
                          strokeWidth="1"
                        />
                      </svg>
                    </div>
                    <div className="text-sm">Waves</div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-8"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#2C8C7C]/20">
                <h2 className="text-2xl font-medium text-center text-gray-900 dark:text-white">
                  {poemTitle}
                </h2>
              </div>

              <div className="p-8 bg-white dark:bg-gray-900 min-h-[300px] flex items-center justify-center">
                <div className="max-w-lg text-center relative">
                  {canvasWords.map((word) => (
                    <span
                      key={word.id}
                      className="inline-block m-1 px-2 py-1 text-[#2C8C7C]"
                    >
                      {getDisplayText(word)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-[#2C8C7C]/20 flex justify-between">
                <motion.button
                  onClick={handleSavePoem}
                  className="px-4 py-2 rounded-lg bg-[#2C8C7C]
                    hover:bg-[#2C8C7C]/90 text-white transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Save Poem
                </motion.button>

                <motion.button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 rounded-lg bg-[#2C8C7C]/10 
                    hover:bg-[#2C8C7C]/20 text-[#2C8C7C] transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Close Preview
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center"
          >
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowResetConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-gray-950 rounded-xl 
                border border-[#2C8C7C]/20 p-6 w-80 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-[#2C8C7C] mb-3">
                Reset Canvas?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                This will remove all words from the canvas. This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-3">
                <motion.button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-lg hover:bg-[#2C8C7C]/5 
                    text-[#2C8C7C] transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={resetCanvas}
                  className="px-4 py-2 rounded-lg bg-[#2C8C7C]/10 
                    hover:bg-[#2C8C7C]/20 text-[#2C8C7C] transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Reset
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CanvasView;
