import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripHorizontal } from "lucide-react";
import WordCanvas from "./components/WordCanvas";
import ToolBar from "./components/ToolBar";
import UIBackground from "../../shared/UIBackground";
import { useCraftState } from "./hooks/useCraftState";

const WordPool = ({ words, onDragStart }) => (
  <div className="w-64 h-full overflow-y-auto bg-white/5 backdrop-blur-sm border-r border-cyan-500/20">
    <div className="p-4 border-b border-cyan-500/20">
      <h2 className="text-cyan-300 font-medium">Word Pool</h2>
    </div>
    <div className="p-4 space-y-2">
      {words.map((word) => (
        <motion.div
          key={word.id}
          className="group p-2 bg-white/5 rounded-lg border border-cyan-500/10 
            hover:bg-white/10 hover:border-cyan-500/20 cursor-grab
            transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          drag
          dragSnapToOrigin
          onDragEnd={(e, info) => onDragStart(word, info)}
        >
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-4 h-4 text-cyan-500/50 group-hover:text-cyan-400/70" />
            <span className="text-cyan-100/70 group-hover:text-cyan-100">
              {word.text}
            </span>
          </div>
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
                  {getTemplateDescription(template)}
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const getTemplateDescription = (template) => {
  const descriptions = {
    Sonnet: "14 lines, following traditional rhyme schemes",
    Haiku: "3 lines, 5-7-5 syllable pattern",
    "Free Verse": "Unrestricted form, natural flow",
    Villanelle: "19 lines with repeating refrains",
  };
  return descriptions[template];
};

const CraftMode = ({ selectedWords = [], onComplete, enabled = true }) => {
  const { words, setWords, preview, handlePreviewToggle, handleComplete } =
    useCraftState(selectedWords, onComplete);

  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [selectedWordId, setSelectedWordId] = useState(null);

  useEffect(() => {
    const initialWords = selectedWords.map((text, index) => ({
      id: `word-${index}`,
      text,
      position: { x: 0, y: 0 },
      depth: Math.random(),
      scale: 1,
      rotation: 0,
      inCanvas: false,
    }));
    setWords(initialWords);
  }, [selectedWords, setWords]);

  const handleWordDragStart = (word, info) => {
    const velocity = info.velocity;
    const magnitude = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);

    if (magnitude > 10) {
      setWords((prevWords) =>
        prevWords.map((w) =>
          w.id === word.id ? { ...w, inCanvas: true, position: info.point } : w
        )
      );
    }
  };

  if (!enabled) return null;

  return (
    <div className="flex h-screen bg-gray-950">
      <UIBackground mode="craft" />

      {/* Left Sidebar - Word Pool */}
      <div className="relative z-10">
        <WordPool
          words={words.filter((w) => !w.inCanvas)}
          onDragStart={handleWordDragStart}
        />
      </div>

      {/* Main Composition Area */}
      <div className="relative flex-1">
        <WordCanvas
          words={words.filter((w) => w.inCanvas)}
          preview={preview}
          template={activeTemplate}
          onSelectWord={setSelectedWordId}
          selectedWordId={selectedWordId}
        />

        <TemplateOverlay
          show={showTemplates}
          onClose={() => setShowTemplates(false)}
          onSelect={setActiveTemplate}
        />

        {/* Complete Button */}
        <motion.button
          onClick={handleComplete}
          className="absolute bottom-8 right-24 px-6 py-3 bg-cyan-500/20 
            hover:bg-cyan-500/30 backdrop-blur-md border border-cyan-400/30 
            rounded-xl text-cyan-300 font-medium transition-all duration-300
            flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Complete
        </motion.button>
      </div>

      {/* Right Sidebar - Tools */}
      <div className="relative z-10">
        <ToolBar
          onDepthChange={() => {
            if (selectedWordId) {
              setWords((prevWords) =>
                prevWords.map((w) =>
                  w.id === selectedWordId
                    ? { ...w, depth: ((w.depth || 0) + 0.2) % 1 }
                    : w
                )
              );
            }
          }}
          onEffectsToggle={() => {
            // Efects toggle
          }}
          onPreviewToggle={handlePreviewToggle}
          onTemplateToggle={() => setShowTemplates(!showTemplates)}
          onSave={() => {
            // Save functionality
          }}
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
