import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WordCanvas from "./components/WordCanvas";
import ToolBar from "./components/ToolBar";
import UIBackground from "../../shared/UIBackground";
import { useCraftState } from "./hooks/useCraftState";

const WordPool = ({ words, onWordSelect }) => (
  <div className="w-64 h-full flex flex-col">
    {/* Fixed header space for menu icon */}
    <div className="h-20 flex-none" />

    {/* Scrollable word list container */}
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-1 px-4">
        {words.map((word) => (
          <motion.button
            key={word.id || `word-${word.text}`}
            className="w-full text-left p-3
              text-gray-300/90 hover:text-cyan-300/90
              hover:bg-white/5 transition-all duration-200"
            whileHover={{ x: 4 }}
            onClick={() => onWordSelect(word)}
          >
            {word.text}
          </motion.button>
        ))}
      </div>
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
        className="absolute inset-4 bg-gradient-to-b from-cyan-950/80 to-cyan-900/80 
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
    <div className="relative h-screen bg-gray-950">
      <UIBackground mode="craft" />

      <div className="absolute inset-0 flex">
        {/* Left Sidebar */}
        <div className="relative">
          <div className="h-full w-64 backdrop-blur-sm bg-gray-950/30">
            <WordPool words={poolWords} onWordSelect={handleAddToCanvas} />
          </div>
          {/* Soft edge gradient */}
          <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-r from-cyan-500/10 to-transparent" />
        </div>

        {/* Main Composition Area */}
        <div className="flex-1 flex flex-col">
          {/* Top gradient border */}
          <div className="h-1 bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-cyan-500/10 rounded-full mx-6 mt-6" />

          {/* Canvas Container */}
          <div className="flex-1 relative mx-6 mb-">
            <div className="absolute inset-0">
              <WordCanvas
                words={canvasWords}
                selectedWordId={selectedWordId}
                onSelect={handleWordSelect}
                onMove={handleWordMove}
                template={activeTemplate}
                preview={preview}
              />
            </div>

            <TemplateOverlay
              show={showTemplates}
              onClose={() => setShowTemplates(false)}
              onSelect={setActiveTemplate}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="relative">
          <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-r from-transparent to-cyan-500/10" />
          <div className="h-full w-20 backdrop-blur-sm bg-gray-950/30">
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
