import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle } from "lucide-react";
import WordCanvas from "./components/WordCanvas";
import ToolBar from "./components/ToolBar";
import UIBackground from "../../shared/UIBackground";
import { useCraftState } from "./hooks/useCraftState";

const WordPool = ({ words, onWordSelect }) => {
  return (
    <div className="w-72 h-full flex flex-col">
      <div className="h-20" />
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

const CraftMode = ({ selectedWords = [], onComplete, enabled = true }) => {
  const {
    words,
    canvasWords,
    setCanvasWords,
    preview,
    capitalizationMode,
    signatures,
    handleCapitalizationChange,
    handlePunctuationSelect,
    handleSignatureAdd,
    handleSignatureSelect,
    handlePreviewToggle,
    handleComplete,
  } = useCraftState(selectedWords, onComplete);

  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [selectedWordId, setSelectedWordId] = useState(null);
  const [poolWords, setPoolWords] = useState([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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

  const handleWordReturn = (wordId) => {
    const word = canvasWords.find((w) => w.id === wordId);
    if (word && word.type === "word") {
      setCanvasWords((prev) => prev.filter((w) => w.id !== wordId));
      setPoolWords((prev) => [
        ...prev,
        {
          id: word.id,
          text: word.text,
          type: "word",
        },
      ]);
    } else if (word && word.type === "punctuation") {
      setCanvasWords((prev) => prev.filter((w) => w.id !== wordId));
    }
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
                capitalizationMode={capitalizationMode}
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
              onCapitalizationChange={() =>
                handleCapitalizationChange(selectedWordId)
              }
              onPunctuationSelect={handlePunctuationSelect}
              onTemplateToggle={() => setShowTemplates(!showTemplates)}
              onSignatureAdd={handleSignatureAdd}
              onSignatureSelect={handleSignatureSelect}
              onPreviewToggle={handlePreviewToggle}
              onReset={() => {
                setShowResetConfirm(true);
              }}
              onComplete={handleComplete}
              activeTools={[
                ...(showTemplates ? ["template"] : []),
                ...(preview ? ["preview"] : []),
                ...(selectedWordId ? ["caps"] : []),
              ]}
              signatures={signatures}
            />
          </div>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowResetConfirm(false)}
          />
          <div className="relative bg-white dark:bg-gray-950 rounded-xl border border-[#2C8C7C]/20 p-6 w-80 shadow-xl">
            <h3 className="text-lg font-medium text-[#2C8C7C] mb-3">
              Reset Canvas?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              This will return all words to the word pool. This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg hover:bg-[#2C8C7C]/5 text-[#2C8C7C] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
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
                }}
                className="px-4 py-2 rounded-lg bg-[#2C8C7C]/10 hover:bg-[#2C8C7C]/20 text-[#2C8C7C] transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CraftMode;
