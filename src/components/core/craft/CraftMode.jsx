import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconAsk,
  IconClose,
  IconGrid,
  IconHash,
  IconLayout,
  IconNib,
  IconPencil,
  IconPlus,
  IconPoemlet,
  IconRetry,
  IconSpark,
  IconStar,
  IconType,
} from "../../shared/icons";
import { toPng } from "html-to-image";
import TemplateGuide from "./components/TemplateGuide";
import Navigation from "../../shared/Navigation";
import AdaptiveBackground from "../../shared/AdaptiveBackground";
import PoolWordsModal from "./components/PoolWordsModal";
import HelpModal from "../../shared/HelpModal";
import { API_URL } from "../../../utils/api";

const CraftMode = ({
  selectedWords = [],
  onComplete,
  enabled = true,
  onExitToHome,
  onSave,
}) => {
  // State management
  const [canvasWords, setCanvasWords] = useState([]);
  const [poolWords, setPoolWords] = useState([]);
  const [selectedWordId, setSelectedWordId] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [signatureWords, setSignatureWords] = useState(Array(5).fill(""));
  const [canvasPattern, setCanvasPattern] = useState("blank");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [previewOffset, setPreviewOffset] = useState({ x: 0, y: 0 });
  const [isDraggingPreview, setIsDraggingPreview] = useState(false);
  const [poemTitle, setPoemTitle] = useState("Today's Poem");
  const previewStartPosition = useRef({ x: 0, y: 0 });
  const [showPoolWordsModal, setShowPoolWordsModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Spark/inspiration state
  const [sparkData, setSparkData] = useState(null);
  const [sparkIndex, setSparkIndex] = useState(0);

  // DOM refs
  const canvasRef = useRef(null);
  const wordsRef = useRef({});

  useEffect(() => {
    const tutorialKey = "hasSeenCraftTutorial";
    const hasSeenBefore = localStorage.getItem(tutorialKey);

    // Show tutorial automatically for first-time visitors
    if (!hasSeenBefore) {
      setTimeout(() => setShowHelp(true), 1000);
      localStorage.setItem(tutorialKey, "true");
    }
  }, []);

  // Fetch daily prompt / spark data
  useEffect(() => {
    const fetchSparkData = async () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const res = await fetch(`${API_URL}/daily-prompt?timezone=${tz}`);
        if (res.ok) {
          const data = await res.json();
          setSparkData(data);
        }
      } catch (err) {
        console.error("Failed to fetch spark data:", err);
      }
    };
    fetchSparkData();
  }, []);

  // Initialize pool words from selectedWords
  useEffect(() => {
    // Check if we have saved craft state first
    const loadSavedState = () => {
      try {
        // Load canvas words
        const savedCanvasWords = localStorage.getItem(
          "poit_craft_canvas_words"
        );
        if (savedCanvasWords) {
          setCanvasWords(JSON.parse(savedCanvasWords));
        }

        // Load pool words
        const savedPoolWords = localStorage.getItem("poit_craft_pool_words");
        if (savedPoolWords) {
          setPoolWords(JSON.parse(savedPoolWords));
          return true; // Indicate we loaded saved state
        }
      } catch (error) {
        console.error("Error loading craft state:", error);
      }
      return false; // No saved state loaded
    };

    // Only initialize from selectedWords if no saved state exists
    if (!loadSavedState()) {
      const initialWords = selectedWords.map((word) => {
        const text = typeof word === "string" ? word : word.text;
        return {
          id: `word-${Math.random().toString(36).substr(2, 9)}`,
          text,
          type: "word",
        };
      });
      setPoolWords(initialWords);
    }
  }, [selectedWords]);

  // Load signature words
  useEffect(() => {
    try {
      const savedSignatureWords = localStorage.getItem("poit_signature_words");
      if (savedSignatureWords) {
        const parsed = JSON.parse(savedSignatureWords);
        if (Array.isArray(parsed) && parsed.length === 5) {
          setSignatureWords(parsed);
        }
      }
    } catch (error) {
      console.error("Error loading signature words:", error);
    }
  }, []);

  // Load session-specific settings
  useEffect(() => {
    // Load canvas pattern
    const savedPattern = localStorage.getItem("poit_craft_canvas_pattern");
    if (savedPattern) {
      setCanvasPattern(savedPattern);
    }

    // Load active template
    const savedTemplate = localStorage.getItem("poit_craft_active_template");
    if (savedTemplate) {
      setActiveTemplate(savedTemplate);
    }

    // Load poem title
    const savedTitle = localStorage.getItem("poit_craft_poem_title");
    if (savedTitle) {
      setPoemTitle(savedTitle);
    }
  }, []);

  // Save signature words (persist across ALL sessions)
  useEffect(() => {
    localStorage.setItem(
      "poit_signature_words",
      JSON.stringify(signatureWords)
    );
  }, [signatureWords]);

  // Save session-specific settings
  useEffect(() => {
    localStorage.setItem("poit_craft_canvas_pattern", canvasPattern);
  }, [canvasPattern]);

  useEffect(() => {
    if (activeTemplate) {
      localStorage.setItem("poit_craft_active_template", activeTemplate);
    } else {
      localStorage.removeItem("poit_craft_active_template");
    }
  }, [activeTemplate]);

  useEffect(() => {
    localStorage.setItem("poit_craft_poem_title", poemTitle);
  }, [poemTitle]);

  // Periodically save the main craft state - this will be used by the onSave function
  useEffect(() => {
    if (canvasWords.length > 0) {
      localStorage.setItem(
        "poit_craft_canvas_words",
        JSON.stringify(canvasWords)
      );
    }
    if (poolWords.length > 0) {
      localStorage.setItem("poit_craft_pool_words", JSON.stringify(poolWords));
    }

    // This will make sure onSave knows there's data to save
    if (canvasWords.length > 0 || poolWords.length > 0) {
      localStorage.setItem("poit_craft_has_data", "true");
    }
  }, [canvasWords, poolWords]);

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

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore keypresses when modals are open or if input/textarea elements are focused
      if (
        isPreviewOpen ||
        showResetConfirm ||
        showPoolWordsModal ||
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA"
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      switch (key) {
        case "c":
          // Capitalization
          if (selectedWordId) {
            handleCapitalizationChange();
          }
          break;
        case "p":
          // Punctuation
          togglePanel(activePanel === "punctuation" ? null : "punctuation");
          break;
        case "f":
          // Filler (Common words)
          togglePanel(activePanel === "common" ? null : "common");
          break;
        case "t":
          // Templates
          togglePanel(activePanel === "templates" ? null : "templates");
          break;
        case "s":
          // Signatures
          togglePanel(activePanel === "signatures" ? null : "signatures");
          break;
        case "b":
          // Canvas (Background)
          togglePanel(activePanel === "canvas" ? null : "canvas");
          break;
        case "i":
          // Inspiration / Spark
          togglePanel(activePanel === "spark" ? null : "spark");
          break;
        case "w":
          // Word pool modal
          setShowPoolWordsModal(true);
          break;
        case "r":
          // Reset canvas
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
  }, [
    selectedWordId,
    activePanel,
    isPreviewOpen,
    showResetConfirm,
    showPoolWordsModal,
  ]);

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

  const handleSignatureWordChange = (index, value) => {
    const newWords = [...signatureWords];
    newWords[index] = value;
    setSignatureWords(newWords);
  };

  const handleRemoveSignatureWord = (index) => {
    const newWords = [...signatureWords];
    newWords[index] = "";
    setSignatureWords(newWords);
  };

  useEffect(() => {
    const savedPattern = localStorage.getItem("poit_canvas_pattern");
    if (savedPattern) {
      setCanvasPattern(savedPattern);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("poit_canvas_pattern", canvasPattern);
  }, [canvasPattern]);

  // Reset preview offset when opening the preview
  useEffect(() => {
    if (isPreviewOpen) {
      setPreviewOffset({ x: 0, y: 0 });
    }
  }, [isPreviewOpen]);

  // Reset title when opening preview if no words are on canvas yet
  useEffect(() => {
    if (isPreviewOpen && canvasWords.length === 0) {
      setPoemTitle("Today's Poem");
    }
  }, [isPreviewOpen, canvasWords.length]);

  useEffect(() => {
    const savedSignatureWords = localStorage.getItem("poit_signature_words");
    if (savedSignatureWords) {
      try {
        const parsed = JSON.parse(savedSignatureWords);
        if (Array.isArray(parsed) && parsed.length === 5) {
          setSignatureWords(parsed);
        }
      } catch (error) {
        console.error("Error loading signature words:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "poit_signature_words",
      JSON.stringify(signatureWords)
    );
  }, [signatureWords]);

  // Reset canvas
  const resetCanvas = () => {
    // Return words to pool
    const wordsToReturn = canvasWords
      .filter((w) => w.type === "word")
      .filter((word) => {
        // Check if this word was one of the originally selected words
        const wordText = word.text || word.content;
        return selectedWords.some((selectedWord) => {
          const selectedText =
            typeof selectedWord === "string" ? selectedWord : selectedWord.text;
          return selectedText.toLowerCase() === wordText.toLowerCase();
        });
      })
      .map((word) => ({
        id: word.id,
        text: word.text || word.content,
        type: "word",
      }));

    setPoolWords((prev) => [...prev, ...wordsToReturn]);
    setCanvasWords([]);
    setSelectedWordId(null);
    setShowResetConfirm(false);

    // Save the changed state immediately
    if (onSave) onSave();
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

  // Handle export and completion
  const handleDownload = async () => {
    if (!canvasRef.current) return;

    try {
      const paperColor = `rgb(${getComputedStyle(document.documentElement)
        .getPropertyValue("--paper")
        .trim()})`;
      const dataUrl = await toPng(canvasRef.current, {
        quality: 1,
        style: {
          transform: "none",
          transformOrigin: "top left",
          padding: "40px",
          background: paperColor,
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

  // Handle save manually when requested
  const handleSave = () => {
    if (onSave) {
      return onSave();
    }
    return false;
  };

  // Handle complete to clear storage after saving
  const handleComplete = () => {
    setIsPreviewOpen(false);

    const poemData = {
      words: canvasWords,
      title: poemTitle,
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

    // Clean up session-specific storage (but NOT signature words)
    localStorage.removeItem("poit_craft_canvas_words");
    localStorage.removeItem("poit_craft_pool_words");
    localStorage.removeItem("poit_craft_has_data");
    localStorage.removeItem("poit_craft_active_template");
    localStorage.removeItem("poit_craft_canvas_pattern");
    localStorage.removeItem("poit_craft_poem_title");

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
  };

  return (
    <div className="relative h-screen">
      <AdaptiveBackground mode="craft" className="opacity-30" />

      <div className="absolute inset-0 flex">
        {/* Navigation */}
        <Navigation
          currentMode="craft"
          onExitToHome={onExitToHome}
          onSave={handleSave}
          onHelpClick={() => setShowHelp(true)}
        />

        {/* Help Button */}
        <motion.button
          onClick={() => setShowHelp(true)}
          className="fixed left-6 bottom-6 z-50 p-2 rounded-full
    bg-surface/60 backdrop-blur-sm border border-seal/15
    hover:bg-seal/10 transition-colors flex items-center justify-center
    h-[40px] w-[40px]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <IconAsk className="w-5 h-5 text-seal" />
        </motion.button>

        {/* Help Modal */}
        <HelpModal
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
          mode="craft"
        />

        {/* Left Sidebar - Word Pool */}
        <div className="relative">
          <div
            className="h-full w-72 backdrop-blur-md bg-surface/80
            border-r border-ink/10"
          >
            <div className="h-20" />
            <div
              className="p-2 space-y-1 overflow-y-auto"
              style={{ height: "calc(100% - 5rem)" }}
            >
              {poolWords.map((word) => (
                <motion.button
                  key={word.id}
                  onClick={() => addWordToCanvas(word)}
                  className="w-full group flex items-center px-4 py-2.5 rounded-lg
                    text-ink/80 hover:text-ink
                    hover:bg-seal/5
                    transition-all duration-200"
                  whileHover={{ x: 4 }}
                >
                  <span className="flex-1 font-serif text-lg">{word.text}</span>
                  <IconPlus
                    className="w-4 h-4 text-seal opacity-0 
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
              className={`absolute inset-0 rounded-2xl 
bg-surface/90 backdrop-blur-md 
border border-ink/10 shadow-leaf dark:shadow-leaf-dark overflow-hidden`}
              style={{
                backgroundImage:
                  canvasPattern === "grid"
                    ? "linear-gradient(to right, rgb(var(--ink) / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--ink) / 0.05) 1px, transparent 1px)"
                    : canvasPattern === "dots"
                    ? "radial-gradient(rgb(var(--ink) / 0.1) 1px, transparent 1px)"
                    : "none",
                backgroundSize:
                  canvasPattern === "grid"
                    ? "40px 40px"
                    : canvasPattern === "dots"
                    ? "20px 20px"
                    : "auto",
              }}
            >
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
                          stroke="rgb(var(--ink) / 0.05)"
                          strokeWidth="1"
                          className=""
                        />
                        <path
                          d="M0,100 C20,90 30,110 50,100 C70,90 80,110 100,100 C120,90 130,110 150,100 C170,90 180,110 200,100"
                          fill="none"
                          stroke="rgb(var(--ink) / 0.05)"
                          strokeWidth="1"
                          className=""
                        />
                        <path
                          d="M0,150 C20,140 30,160 50,150 C70,140 80,160 100,150 C120,140 130,160 150,150 C170,140 180,160 200,150"
                          fill="none"
                          stroke="rgb(var(--ink) / 0.05)"
                          strokeWidth="1"
                          className=""
                        />
                      </pattern>
                    </defs>
                    <rect
                      width="100%"
                      height="100%"
                      fill="url(#wave-pattern)"
                    />
                  </svg>
                </div>
              )}

              {/* Template Guide */}
              <TemplateGuide
                template={activeTemplate}
                isActive={!!activeTemplate}
              />

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
          relative px-3 py-1.5 rounded-md
          transition-all
          ${
            selectedWordId === word.id
              ? "bg-seal/10 outline outline-1 outline-seal"
              : ""
          }
        `}
                  >
                    <span className="font-serif text-lg text-ink">
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
            bg-surface/80
            border-l border-ink/10"
          >
            <div className="h-full p-4 flex flex-col">
              {/* Main tools */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex flex-col gap-5">
                  <button
                    onClick={handleCapitalizationChange}
                    className="p-3 rounded-xl bg-transparent hover:bg-seal/10 
                      border border-seal/30 transition-all duration-300
                      group relative"
                    disabled={!selectedWordId}
                  >
                    <IconType className="w-5 h-5 text-seal/70 group-hover:text-seal" />
                    <div
                      className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
                      bg-surface border border-seal/20 rounded-lg shadow-leaf dark:shadow-leaf-dark
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                      pointer-events-none px-3 py-2 shadow-lg"
                    >
                      <span className="text-sm text-seal whitespace-nowrap font-medium">
                        Capitalization
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => togglePanel("punctuation")}
                    className="p-3 rounded-xl bg-transparent hover:bg-seal/10 
                      border border-seal/30 transition-all duration-300
                      group relative"
                  >
                    <IconNib className="w-5 h-5 text-seal/70 group-hover:text-seal" />
                    <div
                      className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
                      bg-surface border border-seal/20 rounded-lg shadow-leaf dark:shadow-leaf-dark
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                      pointer-events-none px-3 py-2 shadow-lg"
                    >
                      <span className="text-sm text-seal whitespace-nowrap font-medium">
                        Punctuation
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => togglePanel("common")}
                    className="p-3 rounded-xl bg-transparent hover:bg-seal/10 
                      border border-seal/30 transition-all duration-300
                      group relative"
                  >
                    <IconHash className="w-5 h-5 text-seal/70 group-hover:text-seal" />
                    <div
                      className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
                      bg-surface border border-seal/20 rounded-lg shadow-leaf dark:shadow-leaf-dark
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                      pointer-events-none px-3 py-2 shadow-lg"
                    >
                      <span className="text-sm text-seal whitespace-nowrap font-medium">
                        Filler
                      </span>
                    </div>
                  </button>

                  {/* Template Tool */}
                  <button
                    onClick={() => togglePanel("templates")}
                    className="p-3 rounded-xl bg-transparent hover:bg-seal/10 
    border border-seal/30 transition-all duration-300
    group relative"
                  >
                    <IconLayout className="w-5 h-5 text-seal/70 group-hover:text-seal" />
                    <div
                      className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
    bg-surface border border-seal/20 rounded-lg shadow-leaf dark:shadow-leaf-dark
    opacity-0 group-hover:opacity-100 transition-opacity duration-300 
    pointer-events-none px-3 py-2 shadow-lg"
                    >
                      <span className="text-sm text-seal whitespace-nowrap font-medium">
                        Templates
                      </span>
                    </div>
                  </button>

                  {/* Signature Tool */}
                  <button
                    onClick={() => togglePanel("signatures")}
                    className="p-3 rounded-xl bg-transparent hover:bg-seal/10 
    border border-seal/30 transition-all duration-300
    group relative"
                  >
                    <IconStar className="w-5 h-5 text-seal/70 group-hover:text-seal" />
                    <div
                      className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
    bg-surface border border-seal/20 rounded-lg shadow-leaf dark:shadow-leaf-dark
    opacity-0 group-hover:opacity-100 transition-opacity duration-300 
    pointer-events-none px-3 py-2 shadow-lg"
                    >
                      <span className="text-sm text-seal whitespace-nowrap font-medium">
                        Signatures
                      </span>
                    </div>
                  </button>

                  {/* Canvas Pattern Tool */}
                  <button
                    onClick={() => togglePanel("canvas")}
                    className="p-3 rounded-xl bg-transparent hover:bg-seal/10
    border border-seal/30 transition-all duration-300
    group relative"
                  >
                    <IconGrid className="w-5 h-5 text-seal/70 group-hover:text-seal" />
                    <div
                      className="absolute right-full mr-3 top-1/2 -translate-y-1/2
    bg-surface border border-seal/20 rounded-lg shadow-leaf dark:shadow-leaf-dark
    opacity-0 group-hover:opacity-100 transition-opacity duration-300
    pointer-events-none px-3 py-2 shadow-lg"
                    >
                      <span className="text-sm text-seal whitespace-nowrap font-medium">
                        Canvas
                      </span>
                    </div>
                  </button>

                  {/* Spark / Inspiration Tool */}
                  <button
                    onClick={() => togglePanel("spark")}
                    className="p-3 rounded-xl bg-transparent hover:bg-seal/10
    border border-seal/30 transition-all duration-300
    group relative"
                  >
                    <IconSpark className="w-5 h-5 text-seal/70 group-hover:text-seal" />
                    <div
                      className="absolute right-full mr-3 top-1/2 -translate-y-1/2
    bg-surface border border-seal/20 rounded-lg shadow-leaf dark:shadow-leaf-dark
    opacity-0 group-hover:opacity-100 transition-opacity duration-300
    pointer-events-none px-3 py-2 shadow-lg"
                    >
                      <span className="text-sm text-seal whitespace-nowrap font-medium">
                        Inspiration
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Action Tools */}
              <div>
                <div className="w-full h-px bg-seal/10 mb-3" />

                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="p-3 rounded-xl bg-transparent hover:bg-seal/10 
                    border border-seal/30 transition-all duration-300
                    group relative mb-3"
                >
                  <IconRetry className="w-5 h-5 text-seal/70 group-hover:text-seal" />
                  <div
                    className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
                    bg-surface border border-seal/20 rounded-lg shadow-leaf dark:shadow-leaf-dark
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                    pointer-events-none px-3 py-2 shadow-lg"
                  >
                    <span className="text-sm text-seal whitespace-nowrap font-medium">
                      Reset Canvas
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="p-3 rounded-xl bg-transparent hover:bg-seal/10 
                    border border-seal/30 transition-all duration-300
                    group relative"
                >
                  <IconPoemlet className="w-5 h-5 text-seal/70 group-hover:text-seal" />
                  <div
                    className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
                    bg-surface border border-seal/20 rounded-lg shadow-leaf dark:shadow-leaf-dark
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                    pointer-events-none px-3 py-2 shadow-lg"
                  >
                    <span className="text-sm text-seal whitespace-nowrap font-medium">
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
            className="fixed right-28 top-8 bg-surface 
              rounded-lg border border-seal/20 shadow-leaf dark:shadow-leaf-dark
              z-50"
          >
            <div className="flex items-center justify-between p-3 border-b border-seal/10">
              <h3 className="text-label text-seal">Common words</h3>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1 rounded-lg hover:bg-seal/10 text-seal"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3">
              <div className="w-96 space-y-4">
                {categories.map((category) => (
                  <div key={category}>
                    <h4 className="text-seal/70 text-sm mb-2">
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
                            className="px-2 py-1.5 rounded-md font-serif text-base hover:bg-seal/10 
                              text-ink/80 hover:text-ink text-center transition-colors"
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
            className="fixed right-28 top-8 bg-surface 
              rounded-lg border border-seal/20 shadow-leaf dark:shadow-leaf-dark
              z-50"
          >
            <div className="flex items-center justify-between p-3 border-b border-seal/10">
              <h3 className="text-label text-seal">Punctuation</h3>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1 rounded-lg hover:bg-seal/10 text-seal"
              >
                <IconClose className="w-4 h-4" />
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
                    className="p-2 rounded-lg hover:bg-seal/10 
                      text-seal text-center transition-colors"
                  >
                    <div className="text-lg font-medium">{symbol}</div>
                    <div className="text-xs opacity-70">{label}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activePanel === "templates" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed right-28 top-8 bg-surface 
      rounded-lg border border-seal/20 shadow-leaf dark:shadow-leaf-dark
      z-50"
          >
            <div className="flex items-center justify-between p-3 border-b border-seal/10">
              <h3 className="text-label text-seal">Poetic forms</h3>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1 rounded-lg hover:bg-seal/10 text-seal"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3">
              <div className="w-72">
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      setActiveTemplate(
                        activeTemplate === "sonnet" ? null : "sonnet"
                      );
                      setActivePanel(null);
                    }}
                    className={`w-full p-2 rounded-lg hover:bg-seal/10 text-seal text-left transition-colors ${
                      activeTemplate === "sonnet" ? "bg-seal/10" : ""
                    }`}
                  >
                    <div className="font-medium">Sonnet</div>
                    <div className="text-xs opacity-70">
                      14 lines (8+6) with theme progression
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTemplate(
                        activeTemplate === "limerick" ? null : "limerick"
                      );
                      setActivePanel(null);
                    }}
                    className={`w-full mt-1 p-2 rounded-lg hover:bg-seal/10 text-seal text-left transition-colors ${
                      activeTemplate === "limerick" ? "bg-seal/10" : ""
                    }`}
                  >
                    <div className="font-medium">Limerick</div>
                    <div className="text-xs opacity-70">
                      5 lines with AABBA rhyme pattern
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTemplate(
                        activeTemplate === "haiku" ? null : "haiku"
                      );
                      setActivePanel(null);
                    }}
                    className={`w-full p-2 rounded-lg hover:bg-seal/10 text-seal text-left transition-colors ${
                      activeTemplate === "haiku" ? "bg-seal/10" : ""
                    }`}
                  >
                    <div className="font-medium">Haiku</div>
                    <div className="text-xs opacity-70">
                      3 lines with 5-7-5 syllable arrangement
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTemplate(
                        activeTemplate === "tanka" ? null : "tanka"
                      );
                      setActivePanel(null);
                    }}
                    className={`w-full mt-1 p-2 rounded-lg hover:bg-seal/10 text-seal text-left transition-colors ${
                      activeTemplate === "tanka" ? "bg-seal/10" : ""
                    }`}
                  >
                    <div className="font-medium">Tanka</div>
                    <div className="text-xs opacity-70">
                      5 lines extending the haiku form (5-7-5-7-7)
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTemplate(
                        activeTemplate === "lushi" ? null : "lushi"
                      );
                      setActivePanel(null);
                    }}
                    className={`w-full mt-1 p-2 rounded-lg hover:bg-seal/10 text-seal text-left transition-colors ${
                      activeTemplate === "lushi" ? "bg-seal/10" : ""
                    }`}
                  >
                    <div className="font-medium">Lüshi</div>
                    <div className="text-xs opacity-70">
                      8-line Chinese form with parallel couplets
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTemplate(
                        activeTemplate === "ghazal" ? null : "ghazal"
                      );
                      setActivePanel(null);
                    }}
                    className={`w-full p-2 rounded-lg hover:bg-seal/10 text-seal text-left transition-colors ${
                      activeTemplate === "ghazal" ? "bg-seal/10" : ""
                    }`}
                  >
                    <div className="font-medium">Ghazal</div>
                    <div className="text-xs opacity-70">
                      5 couplets with repeating refrains
                    </div>
                  </button>
                </div>

                {activeTemplate && (
                  <button
                    onClick={() => {
                      setActiveTemplate(null);
                      setActivePanel(null);
                    }}
                    className="w-full p-2 mt-4 rounded-lg bg-seal/10 hover:bg-seal/20 text-seal text-center transition-colors"
                  >
                    Clear Template
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activePanel === "signatures" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed right-28 top-8 bg-surface 
      rounded-lg border border-seal/20 shadow-leaf dark:shadow-leaf-dark
      z-50"
          >
            <div className="flex items-center justify-between p-3 border-b border-seal/10">
              <h3 className="text-label text-seal">Your signatures</h3>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1 rounded-lg hover:bg-seal/10 text-seal"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3">
              <div className="w-64 space-y-2">
                <p className="text-sm text-ink/50 mb-2">
                  Add your personal flair:
                </p>
                {signatureWords.map((word, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={word}
                      onChange={(e) =>
                        handleSignatureWordChange(index, e.target.value)
                      }
                      placeholder="Enter word..."
                      className="flex-1 p-2 rounded-lg bg-paper/60 
                border border-ink/15 font-serif text-base text-ink 
                placeholder:text-ink/30
                focus:outline-none focus:ring-1 focus:ring-seal"
                    />
                    <button
                      onClick={() => handleRemoveSignatureWord(index)}
                      className="p-1 rounded-lg hover:bg-seal/10 text-seal"
                    >
                      <IconClose className="w-4 h-4" />
                    </button>
                    {word.trim() && (
                      <button
                        onClick={() =>
                          handlePunctuationSelect({
                            text: word,
                            type: "word",
                          })
                        }
                        className="p-1 rounded-lg hover:bg-seal/10 text-seal"
                      >
                        <IconPlus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activePanel === "canvas" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed right-28 top-8 bg-surface 
      rounded-lg border border-seal/20 shadow-leaf dark:shadow-leaf-dark
      z-50"
          >
            <div className="flex items-center justify-between p-3 border-b border-seal/10">
              <h3 className="text-label text-seal">Canvas background</h3>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1 rounded-lg hover:bg-seal/10 text-seal"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-2 gap-3 w-64">
                <button
                  onClick={() => {
                    setCanvasPattern("blank");
                    setActivePanel(null);
                  }}
                  className={`p-3 rounded-lg hover:bg-seal/10 
            text-seal text-center transition-colors border
            ${
              canvasPattern === "blank"
                ? "border-seal"
                : "border-seal/20"
            }`}
                >
                  <div className="w-full h-16 bg-paper border border-ink/10 rounded-md mb-2"></div>
                  <div className="text-sm">Blank</div>
                </button>

                <button
                  onClick={() => {
                    setCanvasPattern("grid");
                    setActivePanel(null);
                  }}
                  className={`p-3 rounded-lg hover:bg-seal/10 
            text-seal text-center transition-colors border
            ${
              canvasPattern === "grid"
                ? "border-seal"
                : "border-seal/20"
            }`}
                >
                  <div className="w-full h-16 bg-paper border border-ink/10 rounded-md mb-2 relative overflow-hidden">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, rgb(var(--ink) / 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--ink) / 0.1) 1px, transparent 1px)",
                        backgroundSize: "8px 8px",
                      }}
                    ></div>
                  </div>
                  <div className="text-sm">Grid</div>
                </button>

                <button
                  onClick={() => {
                    setCanvasPattern("dots");
                    setActivePanel(null);
                  }}
                  className={`p-3 rounded-lg hover:bg-seal/10 
            text-seal text-center transition-colors border
            ${
              canvasPattern === "dots"
                ? "border-seal"
                : "border-seal/20"
            }`}
                >
                  <div className="w-full h-16 bg-paper border border-ink/10 rounded-md mb-2 relative overflow-hidden">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "radial-gradient(rgb(var(--ink) / 0.1) 1px, transparent 1px)",
                        backgroundSize: "8px 8px",
                      }}
                    ></div>
                  </div>
                  <div className="text-sm">Dots</div>
                </button>

                <button
                  onClick={() => {
                    setCanvasPattern("waves");
                    setActivePanel(null);
                  }}
                  className={`p-3 rounded-lg hover:bg-seal/10 
            text-seal text-center transition-colors border
            ${
              canvasPattern === "waves"
                ? "border-seal"
                : "border-seal/20"
            }`}
                >
                  <div className="w-full h-16 bg-paper border border-ink/10 rounded-md mb-2 relative overflow-hidden">
                    <svg
                      className="absolute inset-0 w-full h-full"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0,20 C10,15 15,25 25,20 C35,15 40,25 50,20 C60,15 65,25 75,20 C85,15 90,25 100,20"
                        fill="none"
                        stroke="rgb(var(--ink) / 0.1)"
                        strokeWidth="1"
                      />
                      <path
                        d="M0,40 C10,35 15,45 25,40 C35,35 40,45 50,40 C60,35 65,45 75,40 C85,35 90,45 100,40"
                        fill="none"
                        stroke="rgb(var(--ink) / 0.1)"
                        strokeWidth="1"
                      />
                    </svg>
                  </div>
                  <div className="text-sm">Waves</div>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spark / Inspiration Panel */}
      <AnimatePresence>
        {activePanel === "spark" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed right-28 top-8 bg-surface
              rounded-lg border border-seal/20 shadow-leaf dark:shadow-leaf-dark z-50 w-80"
          >
            <div className="flex items-center justify-between p-3 border-b border-seal/10">
              <h3 className="text-seal font-medium flex items-center gap-2">
                <IconSpark className="w-4 h-4" />
                Inspiration
              </h3>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1 rounded-lg hover:bg-seal/10 text-seal"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Daily Prompt */}
              {sparkData?.prompt && (
                <div>
                  <div className="text-label text-ink/40 mb-1.5">
                    Today's prompt
                  </div>
                  <p className="font-serif text-sm text-ink/80 italic leading-relaxed">
                    "{sparkData.prompt}"
                  </p>
                  {sparkData.theme && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-seal/10 text-seal">
                      {sparkData.theme}
                    </span>
                  )}
                </div>
              )}

              {/* Suggested Words */}
              {sparkData?.suggestedWords?.length > 0 && (
                <div>
                  <div className="text-label text-ink/40 mb-1.5">
                    Try these words
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sparkData.suggestedWords.map((word) => (
                      <span
                        key={word}
                        className="px-2 py-0.5 rounded-md font-serif text-sm bg-seal/10 text-seal"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Spark Micro-lines */}
              {sparkData?.sparks?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-label text-ink/40">
                      Spark
                    </span>
                    <button
                      onClick={() =>
                        setSparkIndex((prev) => (prev + 1) % sparkData.sparks.length)
                      }
                      className="text-xs text-seal hover:text-seal/80 transition-colors"
                    >
                      next spark
                    </button>
                  </div>
                  <p className="font-serif text-sm text-ink/70 italic border-l-2 border-seal/40 pl-3">
                    {sparkData.sparks[sparkIndex % sparkData.sparks.length]}
                  </p>
                </div>
              )}

              {!sparkData && (
                <p className="font-serif text-sm text-ink/40 italic text-center py-4">
                  Gathering inspiration…
                </p>
              )}
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
        bg-ink/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-surface 
          rounded-xl border border-seal/20 shadow-leaf dark:shadow-leaf-dark overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Preview Header */}
              <div className="absolute top-0 right-0 left-0 h-16 flex justify-between items-center px-6 z-10">
                {/* Title Input */}
                <div className="flex-1 flex justify-center relative group">
                  <input
                    type="text"
                    value={poemTitle}
                    onChange={(e) => setPoemTitle(e.target.value)}
                    placeholder="Enter poem title..."
                    className="px-4 py-2 font-serif text-xl text-center 
                      bg-transparent border-b border-seal/20 
                      focus:border-seal focus:outline-none
                      text-ink
                      placeholder:text-ink/30
                      w-64 transition-all duration-300"
                  />
                  <IconPencil
                    className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 
                    text-seal/40 group-hover:text-seal/60 opacity-0 group-hover:opacity-100
                    transition-opacity duration-300"
                  />
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 rounded-lg hover:bg-seal/10 text-seal transition-colors"
                >
                  <IconClose className="w-5 h-5" />
                </button>
              </div>

              {/* Preview Content */}
              <div className="p-8 pt-16">
                <div
                  className="aspect-[1.4142] w-full bg-paper 
  rounded-lg border border-ink/10 overflow-hidden"
                  style={{
                    position: "relative",
                    cursor: isDraggingPreview ? "grabbing" : "grab",
                    backgroundImage:
                      canvasPattern === "grid"
                        ? "linear-gradient(to right, rgb(var(--ink) / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--ink) / 0.05) 1px, transparent 1px)"
                        : canvasPattern === "dots"
                        ? "radial-gradient(rgb(var(--ink) / 0.1) 1px, transparent 1px)"
                        : "none",
                    backgroundSize:
                      canvasPattern === "grid"
                        ? "40px 40px"
                        : canvasPattern === "dots"
                        ? "20px 20px"
                        : "auto",
                  }}
                  onMouseDown={handlePreviewMouseDown}
                >
                  {/* Waves pattern in preview */}
                  {canvasPattern === "waves" && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <svg className="w-full h-full" preserveAspectRatio="none">
                        <defs>
                          <pattern
                            id="wave-pattern-preview"
                            x="0"
                            y="0"
                            width="200"
                            height="200"
                            patternUnits="userSpaceOnUse"
                          >
                            <path
                              d="M0,50 C20,40 30,60 50,50 C70,40 80,60 100,50 C120,40 130,60 150,50 C170,40 180,60 200,50"
                              fill="none"
                              stroke="rgb(var(--ink) / 0.05)"
                              strokeWidth="1"
                              className=""
                            />
                            <path
                              d="M0,100 C20,90 30,110 50,100 C70,90 80,110 100,100 C120,90 130,110 150,100 C170,90 180,110 200,100"
                              fill="none"
                              stroke="rgb(var(--ink) / 0.05)"
                              strokeWidth="1"
                              className=""
                            />
                            <path
                              d="M0,150 C20,140 30,160 50,150 C70,140 80,160 100,150 C120,140 130,160 150,150 C170,140 180,160 200,150"
                              fill="none"
                              stroke="rgb(var(--ink) / 0.05)"
                              strokeWidth="1"
                              className=""
                            />
                          </pattern>
                        </defs>
                        <rect
                          width="100%"
                          height="100%"
                          fill="url(#wave-pattern-preview)"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-0 right-0 text-center z-10 pointer-events-none">
                    <span className="font-mono text-[11px] text-ink/40 bg-surface/70 px-2 py-1 rounded-md backdrop-blur-sm">
                      click and drag to pan
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
                        <div className="px-3 py-1.5 whitespace-nowrap">
                          <span className="font-serif text-lg text-ink">
                            {getDisplayText(word)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-seal/10 flex justify-between items-center">
                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg
                border border-seal/25 hover:bg-seal/5 
                text-seal font-mono text-xs tracking-wide transition-colors"
                  >
                    <span>Download image</span>
                  </button>
                </div>

                <button
                  onClick={handleComplete}
                  className="group relative flex items-center gap-2 px-6 py-2.5 rounded-lg
              bg-seal hover:bg-seal/90 
              text-paper font-mono text-xs tracking-wide transition-colors"
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
              className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
              onClick={() => setShowResetConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-surface rounded-xl 
                border border-seal/20 p-6 w-80 shadow-leaf dark:shadow-leaf-dark"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-serif text-lg font-medium text-ink mb-3">
                Reset the canvas?
              </h3>
              <p className="text-sm text-ink/60 mb-6">
                This will return all words to the word pool. This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-lg hover:bg-seal/5 
                    text-seal transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={resetCanvas}
                  className="px-4 py-2 rounded-lg bg-seal/10 
                    hover:bg-seal/20 text-seal transition-colors"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pool Words Modal */}
      <PoolWordsModal
        isOpen={showPoolWordsModal}
        onClose={() => setShowPoolWordsModal(false)}
        poolWords={poolWords}
        onWordSelect={(word) => {
          addWordToCanvas(word);
          setShowPoolWordsModal(false);
        }}
      />
    </div>
  );
};

export default CraftMode;
