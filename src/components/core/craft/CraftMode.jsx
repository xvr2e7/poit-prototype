import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle } from "lucide-react";
import { toPng } from "html-to-image";
import WordCanvas from "./components/WordCanvas";
import ToolBar from "./components/ToolBar";
import PreviewModal from "./components/PreviewModal";
import UIBackground from "../../shared/UIBackground";
import { useCraftState } from "./hooks/useCraftState";
import { useTemplate } from "./hooks/useTemplate";
import TemplateGuide from "./components/TemplateGuide";

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

const CraftMode = ({
  selectedWords = [],
  onComplete,
  enabled = true,
  isPlayground = false,
  onPremiumFeature,
}) => {
  const {
    words,
    canvasWords,
    setCanvasWords,
    fontSize,
    alignment,
    preview,
    handleCapitalizationChange,
    handlePunctuationSelect,
    handleSignatureAdd,
    handlePreviewToggle,
  } = useCraftState(selectedWords, onComplete);

  const {
    activeTemplate,
    guideIntensity,
    hoveredPosition,
    activateTemplate,
    deactivateTemplate,
    handlePositionHover,
    adjustWordPosition,
  } = useTemplate();

  const [selectedWordId, setSelectedWordId] = useState(null);
  const [poolWords, setPoolWords] = useState([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showTemplatePanel, setShowTemplatePanel] = useState(false);
  const canvasRef = useRef(null);

  // Initialize pool words from selected words
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
    // Get adjusted position if template is active
    const adjustedPosition = activeTemplate
      ? adjustWordPosition(wordId, position)
      : position;

    setCanvasWords((prev) =>
      prev.map((word) =>
        word.id === wordId ? { ...word, position: adjustedPosition } : word
      )
    );
  };

  const handleWordSelect = (wordId) => {
    setSelectedWordId((prev) => (prev === wordId ? null : wordId));
  };

  const handleWordReturn = (wordId) => {
    const word = canvasWords.find((w) => w.id === wordId);
    if (!word) return;

    setCanvasWords((prev) => prev.filter((w) => w.id !== wordId));

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

  const handlePremiumFeature = (feature) => {
    if (isPlayground && onPremiumFeature) {
      onPremiumFeature(feature);
    }
  };

  const handleTemplateToggle = () => {
    setShowTemplatePanel((prev) => !prev);
  };

  const handleTemplateSelect = (templateId) => {
    if (isPlayground) {
      onPremiumFeature?.("template");
      return;
    }
    activateTemplate(templateId);
    setShowTemplatePanel(false);
  };

  const handleSignatureSelect = (signature) => {
    if (isPlayground) {
      handlePremiumFeature("signature");
    } else {
      handleSignatureAdd(signature);
      setOpenPanel(null);
    }
  };

  const handleDownload = async () => {
    if (isPlayground) {
      handlePremiumFeature("download");
      return;
    }

    if (!canvasRef.current) return;

    try {
      const dataUrl = await toPng(canvasRef.current, {
        quality: 1,
        style: {
          transform: "none",
          transformOrigin: "top left",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          background: "white",
        },
        filter: (node) => !node.classList?.contains("ui-control"),
      });

      const link = document.createElement("a");
      link.download = `poit-poem-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error saving image:", err);
    }
  };

  const handleShare = async () => {
    if (isPlayground) {
      handlePremiumFeature("share");
      return;
    }

    try {
      const dataUrl = await toPng(canvasRef.current, {
        quality: 0.95,
        backgroundColor: "white",
      });

      window.open(
        `https://x.com/intent/post?text=Check%20out%20my%20poem%20on%20POiT!`
      );
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleContinue = () => {
    if (isPlayground) {
      handlePremiumFeature("continue");
      return;
    }

    setIsPreviewOpen(false);
    const poemData = {
      words: canvasWords,
      metadata: {
        createdAt: new Date().toISOString(),
        layout: {
          fontSize,
          alignment,
          template: activeTemplate,
        },
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
              ref={canvasRef}
              className="absolute inset-0 rounded-2xl 
                bg-white/90 dark:bg-gray-900/90 backdrop-blur-md 
                border border-[#2C8C7C]/10 overflow-hidden
                shadow-[inset_0_0_100px_rgba(44,140,124,0.03)]"
            >
              {/* Template guide layer */}
              {activeTemplate && (
                <TemplateGuide
                  template={activeTemplate}
                  isActive={true}
                  onHover={handlePositionHover}
                  className="absolute inset-0 z-0"
                />
              )}

              {/* Word canvas */}
              <WordCanvas
                words={canvasWords}
                selectedWordId={selectedWordId}
                onSelect={handleWordSelect}
                onMove={handleWordMove}
                onReturn={handleWordReturn}
                template={activeTemplate}
                preview={preview}
                className="relative z-10"
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
              onTemplateToggle={handleTemplateToggle}
              onTemplateSelect={handleTemplateSelect}
              onSignatureAdd={handleSignatureAdd}
              onSignatureSelect={handleSignatureSelect}
              onPreviewToggle={() => setIsPreviewOpen(true)}
              onReset={() => setShowResetConfirm(true)}
              activeTools={[
                ...(showTemplatePanel ? ["template"] : []),
                ...(preview ? ["preview"] : []),
                ...(selectedWordId ? ["caps"] : []),
              ]}
              isPlayground={isPlayground}
              onPremiumFeature={handlePremiumFeature}
            />
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onDownload={handleDownload}
        onShare={handleShare}
        onContinue={handleContinue}
        isPlayground={isPlayground}
      >
        <div ref={canvasRef} className="w-full h-full">
          <WordCanvas
            words={canvasWords}
            preview={true}
            selectedWordId={null}
            onSelect={() => {}}
            onMove={() => {}}
            onReturn={() => {}}
            template={activeTemplate}
          />
        </div>
      </PreviewModal>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowResetConfirm(false)}
          />
          <div
            className="relative bg-white dark:bg-gray-950 rounded-xl 
            border border-[#2C8C7C]/20 p-6 w-80 shadow-xl"
          >
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
                className="px-4 py-2 rounded-lg hover:bg-[#2C8C7C]/5 
                  text-[#2C8C7C] transition-colors"
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
                  deactivateTemplate();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-lg bg-[#2C8C7C]/10 
                  hover:bg-[#2C8C7C]/20 text-[#2C8C7C] transition-colors"
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
