import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WordCanvas from "./components/WordCanvas";
import ToolBar from "./components/ToolBar";
import UIBackground from "../../shared/UIBackground";
import { useCraftState } from "./hooks/useCraftState";

const WordPool = ({ words, onWordSelect }) => (
  <div className="w-64 h-full overflow-y-auto bg-white/5 backdrop-blur-sm border-r border-cyan-500/20">
    <div className="p-4 border-b border-cyan-500/20">
      <h2 className="text-cyan-300 font-medium">Word Pool</h2>
    </div>
    <div className="p-4 space-y-2">
      {words.map((word) => (
        <motion.div
          key={word.id || `word-${word.text}`}
          className="group p-2 bg-white/5 rounded-lg border border-cyan-500/10 
            hover:bg-white/10 hover:border-cyan-500/20 cursor-pointer
            transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          onClick={() => onWordSelect(word)}
        >
          <span className="text-cyan-100/70 group-hover:text-cyan-100">
            {word.text}
          </span>
        </motion.div>
      ))}
    </div>
  </div>
);

const TemplateOverlay = ({ show, onClose, onSelect }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-8 bg-gradient-to-b from-cyan-950/80 to-cyan-900/80 
          backdrop-blur-sm rounded-3xl border border-cyan-500/20 z-30"
      >
        <div className="p-8">
          <h3 className="text-lg text-cyan-300 font-medium mb-6">
            Choose a Template
          </h3>
          <div className="grid grid-cols-2 gap-6">
            {["Sonnet", "Haiku", "Free Verse", "Villanelle"].map((template) => (
              <button
                key={template}
                onClick={() => {
                  onSelect(template.toLowerCase());
                  onClose();
                }}
                className="p-6 bg-white/5 rounded-xl border border-cyan-500/20 
                  hover:bg-white/10 hover:border-cyan-500/30
                  transition-all duration-300 group"
              >
                <div className="text-cyan-300 group-hover:text-cyan-200 transition-colors">
                  {template}
                </div>
                <div className="mt-2 text-xs text-cyan-400/60 group-hover:text-cyan-400/80">
                  {template === "Sonnet" &&
                    "14 lines, following traditional rhyme schemes"}
                  {template === "Haiku" && "3 lines, 5-7-5 syllable pattern"}
                  {template === "Free Verse" &&
                    "Unrestricted form, natural flow"}
                  {template === "Villanelle" &&
                    "19 lines with repeating refrains"}
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

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

  // Initialize pool words when selectedWords prop changes
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
    <div className="flex h-screen bg-gray-950">
      <UIBackground mode="craft" />

      {/* Left Sidebar - Word Pool */}
      <div className="relative z-10">
        <WordPool words={poolWords} onWordSelect={handleAddToCanvas} />
      </div>

      {/* Main Composition Area */}
      <div className="relative flex-1 p-4">
        <WordCanvas
          words={canvasWords}
          selectedWordId={selectedWordId}
          onSelect={handleWordSelect}
          onMove={handleWordMove}
          template={activeTemplate}
          preview={preview}
        />

        <TemplateOverlay
          show={showTemplates}
          onClose={() => setShowTemplates(false)}
          onSelect={setActiveTemplate}
        />
      </div>

      {/* Right Sidebar - Tools */}
      <div className="relative z-10">
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
  );
};

export default CraftMode;
