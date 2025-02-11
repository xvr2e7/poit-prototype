import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, PlusCircle } from "lucide-react";
import WordCanvas from "./components/WordCanvas";
import ToolBar from "./components/ToolBar";
import UIBackground from "../../shared/UIBackground";
import { useCraftState } from "./hooks/useCraftState";

const WordPool = ({ words, onWordSelect }) => {
  return (
    <div className="w-72 h-full flex flex-col">
      {/* Spacer for menu */}
      <div className="h-20" />

      {/* Word list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {words.map((word) => (
            <motion.button
              key={word.id || `word-${word.text}`}
              onClick={() => onWordSelect(word)}
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
  );
};

const TemplateOverlay = ({ show, onClose, onSelect }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="absolute inset-4 bg-gray-950/95 backdrop-blur-md 
          rounded-2xl border border-cyan-500/20 z-30"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium text-cyan-50">
              Choose Template
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 text-cyan-300
                transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {["Sonnet", "Haiku", "Free Verse", "Villanelle"].map((template) => (
              <button
                key={template}
                onClick={() => {
                  onSelect(template.toLowerCase());
                  onClose();
                }}
                className="p-6 rounded-xl border border-cyan-500/20 
                  hover:border-cyan-500/40 hover:bg-white/5
                  transition-all duration-300 group text-left"
              >
                <div
                  className="text-lg font-medium text-cyan-50 
                  group-hover:text-cyan-300 transition-colors"
                >
                  {template}
                </div>
                <p className="mt-2 text-sm text-cyan-300/60">
                  {template === "Sonnet" &&
                    "14 lines, traditional rhyme schemes"}
                  {template === "Haiku" && "3 lines, 5-7-5 syllable pattern"}
                  {template === "Free Verse" &&
                    "Unrestricted form, natural flow"}
                  {template === "Villanelle" &&
                    "19 lines with repeating refrains"}
                </p>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const handleWordReturn = (wordId) => {
  const word = canvasWords.find((w) => w.id === wordId);
  if (word) {
    // Remove from canvas
    setCanvasWords((prev) => prev.filter((w) => w.id !== wordId));
    // Add back to pool
    setPoolWords((prev) => [
      ...prev,
      {
        id: word.id,
        text: word.text,
        depth: 1,
        scale: 1,
      },
    ]);
  }
};

const CraftMode = ({ selectedWords = [], onComplete, enabled = true }) => {
  const {
    preview,
    handlePreviewToggle,
    handleComplete,
    canvasWords,
    setCanvasWords,
  } = useCraftState(selectedWords, onComplete);

  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [selectedWordId, setSelectedWordId] = useState(null);
  const [poolWords, setPoolWords] = useState([]);

  useEffect(() => {
    const initialWords = selectedWords.map((word) => {
      const text = typeof word === "string" ? word : word.text;
      return {
        id: `word-${Math.random().toString(36).substr(2, 9)}`,
        text,
        depth: 1,
        scale: 1,
      };
    });
    setPoolWords(initialWords);
  }, [selectedWords]);

  const handleAddToCanvas = (word) => {
    const canvasWord = {
      ...word,
      position: {
        x: Math.random() * 100,
        y: Math.random() * 100,
      },
    };

    setPoolWords((prev) => prev.filter((w) => w.id !== word.id));
    setCanvasWords((prev) => [...prev, canvasWord]);
  };

  const handleWordMove = (wordId, position) => {
    setCanvasWords((prev) =>
      prev.map((word) => (word.id === wordId ? { ...word, position } : word))
    );
  };

  const handleWordSelect = (wordId) => {
    setSelectedWordId((prev) => (prev === wordId ? null : wordId));
  };

  if (!enabled) return null;

  return (
    <div className="relative h-screen bg-gray-50 dark:bg-gray-950">
      <UIBackground mode="craft" className="opacity-30" />

      <div className="absolute inset-0 flex">
        {/* Left Sidebar */}
        <div className="relative">
          <div
            className="h-full backdrop-blur-md bg-white/80 dark:bg-gray-950/80
            border-r border-[#2C8C7C]/10"
          >
            <WordPool words={poolWords} onWordSelect={handleAddToCanvas} />
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative m-6">
            <div
              className="absolute inset-0 rounded-2xl 
              bg-white/90 dark:bg-gray-900/90 backdrop-blur-md 
              border border-[#2C8C7C]/10 overflow-hidden
              shadow-[inset_0_0_100px_rgba(44,140,124,0.03)]"
            >
              <WordCanvas
                words={canvasWords}
                selectedWordId={selectedWordId}
                onSelect={handleWordSelect}
                onMove={handleWordMove}
                onReturn={handleWordReturn}
                template={activeTemplate}
                preview={preview}
              />
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
            <ToolBar
              onDepthChange={() => {
                if (selectedWordId) {
                  setCanvasWords((prev) =>
                    prev.map((word) =>
                      word.id === selectedWordId
                        ? { ...word, depth: ((word.depth || 0) + 0.2) % 1 }
                        : word
                    )
                  );
                }
              }}
              onPreviewToggle={handlePreviewToggle}
              onTemplateToggle={() => setShowTemplates(!showTemplates)}
              onComplete={handleComplete}
              activeTools={[
                ...(showTemplates ? ["template"] : []),
                ...(preview ? ["preview"] : []),
                ...(selectedWordId ? ["depth"] : []),
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CraftMode;
