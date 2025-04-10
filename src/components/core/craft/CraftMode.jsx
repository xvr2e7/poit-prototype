import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Type,
  PenTool,
  Hash,
  Layout,
  Star,
  RotateCcw,
  BookMarked,
  X,
  Grid,
} from "lucide-react";
import { toPng } from "html-to-image";
import Navigation from "../../shared/Navigation";
import AdaptiveBackground from "../../shared/AdaptiveBackground";

const CraftMode = ({ selectedWords = [], onComplete, enabled = true }) => {
  // State management
  const [canvasWords, setCanvasWords] = useState([]);
  const [poolWords, setPoolWords] = useState([]);
  const [selectedWordId, setSelectedWordId] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [previewOffset, setPreviewOffset] = useState({ x: 0, y: 0 });
  const [isDraggingPreview, setIsDraggingPreview] = useState(false);
  const previewStartPosition = useRef({ x: 0, y: 0 });

  // DOM refs
  const canvasRef = useRef(null);
  const wordsRef = useRef({});

  // Common words with categories
  const commonWords = [
    { word: "I", category: "Pronouns" },
    { word: "you", category: "Pronouns" },
    { word: "he", category: "Pronouns" },
    { word: "she", category: "Pronouns" },
    { word: "it", category: "Pronouns" },
    { word: "we", category: "Pronouns" },
    { word: "they", category: "Pronouns" },
    { word: "me", category: "Pronouns" },
    { word: "him", category: "Pronouns" },
    { word: "her", category: "Pronouns" },
    { word: "us", category: "Pronouns" },
    { word: "them", category: "Pronouns" },
    { word: "my", category: "Pronouns" },
    { word: "your", category: "Pronouns" },
    { word: "our", category: "Pronouns" },
    { word: "their", category: "Pronouns" },
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
    { word: "from", category: "Prepositions" },
    { word: "through", category: "Prepositions" },
    { word: "the", category: "Articles" },
    { word: "a", category: "Articles" },
    { word: "an", category: "Articles" },
  ];

  const categories = [...new Set(commonWords.map((w) => w.category))];

  // Initialize pool words from selectedWords
  useEffect(() => {
    const initialWords = selectedWords.map((word) => {
      const text = typeof word === "string" ? word : word.text;
      return {
        id: `word-${Math.random().toString(36).substr(2, 9)}`,
        text,
        type: "word",
      };
    });
    setPoolWords(initialWords);
  }, [selectedWords]);

  // ===== Word Manipulation Handlers =====

  const addWordToCanvas = (word) => {
    // Position words more on the left side initially
    const canvasWord = {
      ...word,
      position: {
        x: Math.random() * 200 + 50,
        y: Math.random() * 200 + 50,
      },
    };

    setPoolWords((prev) => prev.filter((w) => w.id !== word.id));
    setCanvasWords((prev) => [...prev, canvasWord]);
  };

  const handleWordSelect = (wordId) => {
    setSelectedWordId((prev) => (prev === wordId ? null : wordId));
  };

  const returnWordToPool = (wordId) => {
    const word = canvasWords.find((w) => w.id === wordId);
    if (!word) return;

    // Remove from canvas
    setCanvasWords((prev) => prev.filter((w) => w.id !== wordId));

    // Only add back to pool if it's a word (not punctuation)
    if (word.type === "word") {
      setPoolWords((prev) => [
        ...prev,
        {
          id: word.id,
          text: word.text,
          type: "word",
        },
      ]);
    }

    if (selectedWordId === wordId) {
      setSelectedWordId(null);
    }
  };

  // ===== Direct Drag Handling =====

  const startDrag = (e, wordId) => {
    // Skip if already dragging or in preview mode
    if (e.currentTarget.dataset.dragging === "true" || isPreviewOpen) return;

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

      const x = moveEvent.clientX - canvasBounds.left - offsetX;
      const y = moveEvent.clientY - canvasBounds.top - offsetY;

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

  // Handle double-click to return word to pool
  const handleDoubleClick = (e, wordId) => {
    e.preventDefault();
    returnWordToPool(wordId);
  };

  // ===== Toolbar Actions =====

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

  // Reset canvas
  const resetCanvas = () => {
    // Return words to pool
    const wordsToReturn = canvasWords
      .filter((w) => w.type === "word")
      .map((word) => ({
        id: word.id,
        text: word.text || word.content,
        type: "word",
      }));

    setPoolWords((prev) => [...prev, ...wordsToReturn]);
    setCanvasWords([]);
    setSelectedWordId(null);
    setShowResetConfirm(false);
  };

  const handlePreviewMouseDown = (e) => {
    // Only primary mouse button (left click)
    if (e.button !== 0) return;

    setIsDraggingPreview(true);
    previewStartPosition.current = {
      x: e.clientX - previewOffset.x,
      y: e.clientY - previewOffset.y,
    };

    // Prevent text selection during drag
    e.preventDefault();
  };

  const handlePreviewMouseMove = (e) => {
    if (!isDraggingPreview) return;

    const newOffset = {
      x: e.clientX - previewStartPosition.current.x,
      y: e.clientY - previewStartPosition.current.y,
    };

    setPreviewOffset(newOffset);
  };

  const handlePreviewMouseUp = () => {
    setIsDraggingPreview(false);
  };

  useEffect(() => {
    if (isDraggingPreview) {
      // Add global event listeners when dragging starts
      document.addEventListener("mousemove", handlePreviewMouseMove);
      document.addEventListener("mouseup", handlePreviewMouseUp);

      // Cleanup function
      return () => {
        document.removeEventListener("mousemove", handlePreviewMouseMove);
        document.removeEventListener("mouseup", handlePreviewMouseUp);
      };
    }
  }, [isDraggingPreview]); // Only re-add listeners when dragging state changes

  // Reset preview offset when opening the preview
  useEffect(() => {
    if (isPreviewOpen) {
      setPreviewOffset({ x: 0, y: 0 });
    }
  }, [isPreviewOpen]);

  // Handle export and completion
  const handleDownload = async () => {
    if (!canvasRef.current) return;

    try {
      const dataUrl = await toPng(canvasRef.current, {
        quality: 1,
        style: {
          transform: "none",
          transformOrigin: "top left",
          padding: "40px",
          background: "white",
        },
      });

      const link = document.createElement("a");
      link.download = `poit-poem-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error saving image:", err);
    }
  };

  const handleComplete = () => {
    setIsPreviewOpen(false);

    const poemData = {
      words: canvasWords,
      metadata: {
        createdAt: new Date().toISOString(),
      },
      components: canvasWords.map((word) => ({
        ...word,
        type: word.type || "word",
        position: {
          x: word.position?.x || 0,
          y: word.position?.y || 0,
        },
      })),
    };

    onComplete(poemData);
  };

  if (!enabled) return null;

  // ===== Rendering =====

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

    const getCanvasBoundaries = () => {
      // Get min/max coordinates to determine actual content boundaries
      if (canvasWords.length === 0)
        return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };

      // Initialize with first word position
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      // Find boundaries by examining all word positions
      canvasWords.forEach((word) => {
        const x = word.position?.x || 0;
        const y = word.position?.y || 0;
        // Approximate width and height of the word container
        const width = 100; // Estimate for word width with padding
        const height = 50; // Estimate for word height with padding

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
      });

      // Add some padding
      minX = Math.max(0, minX - 20);
      minY = Math.max(0, minY - 20);
      maxX = maxX + 20;
      maxY = maxY + 20;

      return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY,
      };
    };
  };

  return (
    <div className="relative h-screen bg-gray-50 dark:bg-gray-950">
      <AdaptiveBackground mode="craft" className="opacity-30" />

      <div className="absolute inset-0 flex">
        {/* Navigation */}
        <Navigation currentMode="craft" />

        {/* Left Sidebar - Word Pool */}
        <div className="relative">
          <div
            className="h-full w-72 backdrop-blur-md bg-white/80 dark:bg-gray-950/80
            border-r border-[#2C8C7C]/10"
          >
            <div className="h-20" /> {/* Spacing for logo */}
            <div
              className="p-2 space-y-1 overflow-y-auto"
              style={{ height: "calc(100% - 5rem)" }}
            >
              {poolWords.map((word) => (
                <motion.button
                  key={word.id}
                  onClick={() => addWordToCanvas(word)}
                  className="w-full group flex items-center px-4 py-3 rounded-xl
                    text-[#2C8C7C] dark:text-[#2C8C7C]/90
                    hover:bg-[#2C8C7C]/5 dark:hover:bg-[#2C8C7C]/10
                    transition-all duration-200"
                  whileHover={{ x: 4 }}
                >
                  <span className="flex-1 font-medium">{word.text}</span>
                  <PlusCircle
                    className="w-4 h-4 text-[#2C8C7C] opacity-0 
                    group-hover:opacity-100 transition-opacity"
                  />
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative m-6">
            <div
              ref={canvasRef}
              className="absolute inset-0 rounded-2xl 
                bg-white/90 dark:bg-gray-900/90 backdrop-blur-md 
                border border-[#2C8C7C]/10 overflow-hidden"
            >
              {/* Words on Canvas */}
              {canvasWords.map((word) => (
                <div
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
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Toolbar */}
        <div className="relative">
          <div
            className="h-full w-20 backdrop-blur-md 
            bg-white/80 dark:bg-gray-950/80
            border-l border-[#2C8C7C]/10"
          >
            <div className="h-full p-4 flex flex-col">
              {/* Main tools */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex flex-col gap-5">
                  <button
                    onClick={handleCapitalizationChange}
                    className="p-3 rounded-xl bg-white/5 hover:bg-[#2C8C7C]/10 
                      border border-[#2C8C7C]/30 transition-all duration-300
                      group relative"
                    disabled={!selectedWordId}
                  >
                    <Type className="w-5 h-5 text-[#2C8C7C]/70 group-hover:text-[#2C8C7C]" />
                    <div
                      className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
                      bg-white dark:bg-gray-950 border border-[#2C8C7C]/20 rounded-lg
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                      pointer-events-none px-3 py-2 shadow-lg"
                    >
                      <span className="text-sm text-[#2C8C7C] whitespace-nowrap font-medium">
                        Capitalization
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => togglePanel("punctuation")}
                    className="p-3 rounded-xl bg-white/5 hover:bg-[#2C8C7C]/10 
                      border border-[#2C8C7C]/30 transition-all duration-300
                      group relative"
                  >
                    <PenTool className="w-5 h-5 text-[#2C8C7C]/70 group-hover:text-[#2C8C7C]" />
                    <div
                      className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
                      bg-white dark:bg-gray-950 border border-[#2C8C7C]/20 rounded-lg
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                      pointer-events-none px-3 py-2 shadow-lg"
                    >
                      <span className="text-sm text-[#2C8C7C] whitespace-nowrap font-medium">
                        Punctuation
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => togglePanel("common")}
                    className="p-3 rounded-xl bg-white/5 hover:bg-[#2C8C7C]/10 
                      border border-[#2C8C7C]/30 transition-all duration-300
                      group relative"
                  >
                    <Hash className="w-5 h-5 text-[#2C8C7C]/70 group-hover:text-[#2C8C7C]" />
                    <div
                      className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
                      bg-white dark:bg-gray-950 border border-[#2C8C7C]/20 rounded-lg
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                      pointer-events-none px-3 py-2 shadow-lg"
                    >
                      <span className="text-sm text-[#2C8C7C] whitespace-nowrap font-medium">
                        Filler
                      </span>
                    </div>
                  </button>

                  {/* Template Tool */}
                  <button
                    onClick={() => {}}
                    className="p-3 rounded-xl bg-white/5 hover:bg-[#2C8C7C]/10 
                      border border-[#2C8C7C]/30 transition-all duration-300
                      group relative"
                  >
                    <Layout className="w-5 h-5 text-[#2C8C7C]/70 group-hover:text-[#2C8C7C]" />
                    <div
                      className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
                      bg-white dark:bg-gray-950 border border-[#2C8C7C]/20 rounded-lg
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                      pointer-events-none px-3 py-2 shadow-lg"
                    >
                      <span className="text-sm text-[#2C8C7C] whitespace-nowrap font-medium">
                        Templates
                      </span>
                    </div>
                  </button>

                  {/* Signature Tool */}
                  <button
                    onClick={() => {}}
                    className="p-3 rounded-xl bg-white/5 hover:bg-[#2C8C7C]/10 
                      border border-[#2C8C7C]/30 transition-all duration-300
                      group relative"
                  >
                    <Star className="w-5 h-5 text-[#2C8C7C]/70 group-hover:text-[#2C8C7C]" />
                    <div
                      className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
                      bg-white dark:bg-gray-950 border border-[#2C8C7C]/20 rounded-lg
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                      pointer-events-none px-3 py-2 shadow-lg"
                    >
                      <span className="text-sm text-[#2C8C7C] whitespace-nowrap font-medium">
                        Signatures
                      </span>
                    </div>
                  </button>

                  {/* Canvas Pattern Tool */}
                  <button
                    onClick={() => {}}
                    className="p-3 rounded-xl bg-white/5 hover:bg-[#2C8C7C]/10 
                      border border-[#2C8C7C]/30 transition-all duration-300
                      group relative"
                  >
                    <Grid className="w-5 h-5 text-[#2C8C7C]/70 group-hover:text-[#2C8C7C]" />
                    <div
                      className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
                      bg-white dark:bg-gray-950 border border-[#2C8C7C]/20 rounded-lg
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                      pointer-events-none px-3 py-2 shadow-lg"
                    >
                      <span className="text-sm text-[#2C8C7C] whitespace-nowrap font-medium">
                        Canvas
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Action Tools */}
              <div>
                <div className="w-full h-px bg-[#2C8C7C]/10 mb-3" />

                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-[#2C8C7C]/10 
                    border border-[#2C8C7C]/30 transition-all duration-300
                    group relative mb-3"
                >
                  <RotateCcw className="w-5 h-5 text-[#2C8C7C]/70 group-hover:text-[#2C8C7C]" />
                  <div
                    className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
                    bg-white dark:bg-gray-950 border border-[#2C8C7C]/20 rounded-lg
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                    pointer-events-none px-3 py-2 shadow-lg"
                  >
                    <span className="text-sm text-[#2C8C7C] whitespace-nowrap font-medium">
                      Reset Canvas
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-[#2C8C7C]/10 
                    border border-[#2C8C7C]/30 transition-all duration-300
                    group relative"
                >
                  <BookMarked className="w-5 h-5 text-[#2C8C7C]/70 group-hover:text-[#2C8C7C]" />
                  <div
                    className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
                    bg-white dark:bg-gray-950 border border-[#2C8C7C]/20 rounded-lg
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                    pointer-events-none px-3 py-2 shadow-lg"
                  >
                    <span className="text-sm text-[#2C8C7C] whitespace-nowrap font-medium">
                      Preview Poem
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Common Words Panel with Categories */}
      <AnimatePresence>
        {activePanel === "common" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
                          <button
                            key={word}
                            onClick={() =>
                              handlePunctuationSelect({
                                text: word,
                                type: "word",
                              })
                            }
                            className="px-2 py-1.5 rounded-lg text-sm hover:bg-[#2C8C7C]/10 
                              text-[#2C8C7C] text-center transition-colors"
                          >
                            {word}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activePanel === "punctuation" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
                  <button
                    key={symbol}
                    onClick={() =>
                      handlePunctuationSelect({
                        text: symbol,
                        type: "punctuation",
                      })
                    }
                    className="p-2 rounded-lg hover:bg-[#2C8C7C]/10 
                      text-[#2C8C7C] text-center transition-colors"
                  >
                    <div className="text-lg font-medium">{symbol}</div>
                    <div className="text-xs opacity-70">{label}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 
        bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white dark:bg-gray-950 
          rounded-xl border border-[#2C8C7C]/20 shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Preview Header */}
              <div className="absolute top-0 right-0 left-0 h-16 flex justify-end items-center px-6 z-10">
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 rounded-lg hover:bg-[#2C8C7C]/10 text-[#2C8C7C] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preview Content */}
              <div className="p-8 pt-16">
                <div
                  className="aspect-[1.4142] w-full bg-white dark:bg-gray-900 
    rounded-lg border border-[#2C8C7C]/10 overflow-hidden"
                  style={{
                    position: "relative",
                    cursor: isDraggingPreview ? "grabbing" : "grab",
                  }}
                  onMouseDown={handlePreviewMouseDown}
                >
                  <div className="absolute bottom-2 left-0 right-0 text-center z-10 pointer-events-none">
                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-900/50 px-2 py-1 rounded-md backdrop-blur-sm">
                      Click and drag to pan
                    </span>
                  </div>

                  <div
                    className="absolute inset-0 transform"
                    style={{
                      transform: `translate(${previewOffset.x}px, ${previewOffset.y}px)`,
                      transition: isDraggingPreview
                        ? "none"
                        : "transform 0.2s ease-out",
                    }}
                  >
                    {canvasWords.map((word) => (
                      <div
                        key={word.id}
                        className="absolute select-none"
                        style={{
                          left: word.position?.x || 0,
                          top: word.position?.y || 0,
                          pointerEvents: "none",
                        }}
                      >
                        <div className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm whitespace-nowrap">
                          <span className="text-[#2C8C7C] font-medium">
                            {getDisplayText(word)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-[#2C8C7C]/10 flex justify-between items-center">
                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg
                bg-[#2C8C7C]/10 hover:bg-[#2C8C7C]/20 
                text-[#2C8C7C] transition-colors"
                  >
                    <span>Download</span>
                  </button>
                </div>

                <button
                  onClick={handleComplete}
                  className="group relative flex items-center gap-2 px-6 py-2 rounded-lg
              bg-[#2C8C7C] hover:bg-[#2C8C7C]/90 
              text-white transition-colors"
                >
                  <span>Continue to Echo</span>
                </button>
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
            className="fixed inset-0 z-50 flex items-center justify-center"
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
                This will return all words to the word pool. This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-lg hover:bg-[#2C8C7C]/5 
                    text-[#2C8C7C] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={resetCanvas}
                  className="px-4 py-2 rounded-lg bg-[#2C8C7C]/10 
                    hover:bg-[#2C8C7C]/20 text-[#2C8C7C] transition-colors"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CraftMode;
