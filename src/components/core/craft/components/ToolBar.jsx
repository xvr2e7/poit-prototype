import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Type,
  PenTool,
  ArrowRightCircle,
  BookMarked,
  Save,
  Layout,
  Plus,
  Star,
  RotateCcw,
  X,
  Edit2,
  Check,
  Hash,
} from "lucide-react";

const ToolButton = ({ icon: Icon, label, onClick, isActive }) => {
  const baseClasses =
    "group relative p-3 rounded-xl backdrop-blur-sm transition-all duration-300";

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${baseClasses} bg-white/5 hover:bg-[#2C8C7C]/10 
        border border-[#2C8C7C]/30 ${isActive ? "bg-[#2C8C7C]/10" : ""}`}
    >
      <Icon
        className={`relative z-10 w-5 h-5 transition-colors duration-300
          text-[#2C8C7C]/70 group-hover:text-[#2C8C7C]
          ${isActive ? "text-[#2C8C7C]" : ""}`}
      />

      {/* Tooltip */}
      <div
        className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
        bg-white dark:bg-gray-950 border border-[#2C8C7C]/20 rounded-lg
        opacity-0 group-hover:opacity-100 transition-opacity duration-300 
        pointer-events-none px-3 py-2 shadow-lg"
      >
        <span className="text-sm text-[#2C8C7C] whitespace-nowrap font-medium">
          {label}
        </span>
      </div>
    </motion.button>
  );
};

const ToolSeparator = () => (
  <div className="w-full h-px bg-[#2C8C7C]/10 my-3" />
);

const ToolGroup = ({ children, className = "" }) => (
  <div className={`flex flex-col gap-3 ${className}`}>{children}</div>
);

const Panel = ({ isOpen, onClose, title, children }) => {
  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{
        x: isOpen ? 0 : -100,
        opacity: isOpen ? 1 : 0,
      }}
      className="fixed right-28 top-8 bg-white dark:bg-gray-950 
        rounded-lg border border-[#2C8C7C]/20 shadow-lg"
    >
      <div className="flex items-center justify-between p-3 border-b border-[#2C8C7C]/10">
        <h3 className="text-[#2C8C7C] font-medium">{title}</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-[#2C8C7C]/10 text-[#2C8C7C]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-3">{children}</div>
    </motion.div>
  );
};

const PunctuationPanel = ({ isOpen, onClose, onSelect }) => {
  const punctuation = [
    { symbol: ".", label: "Period" },
    { symbol: ",", label: "Comma" },
    { symbol: ";", label: "Semicolon" },
    { symbol: ":", label: "Colon" },
    { symbol: "—", label: "Em dash" },
    { symbol: "?", label: "Question mark" },
    { symbol: "!", label: "Exclamation" },
  ];

  return (
    <Panel isOpen={isOpen} onClose={onClose} title="Add Punctuation">
      <div className="grid grid-cols-2 gap-2 w-48">
        {punctuation.map(({ symbol, label }) => (
          <button
            key={symbol}
            onClick={() => onSelect(symbol)}
            className="p-2 rounded-lg hover:bg-[#2C8C7C]/10 
              text-[#2C8C7C] text-center transition-colors"
          >
            <div className="text-lg font-medium">{symbol}</div>
            <div className="text-xs opacity-70">{label}</div>
          </button>
        ))}
      </div>
    </Panel>
  );
};

const SignatureItem = ({ signature, onSave, onDelete, onSelect }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(signature);

  const handleSave = () => {
    onSave(value);
    setIsEditing(false);
  };

  return isEditing ? (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 p-2 rounded-lg bg-white/50 dark:bg-gray-900/50
          border border-[#2C8C7C]/20 text-[#2C8C7C] text-sm
          focus:outline-none focus:border-[#2C8C7C]/40"
        maxLength={15}
      />
      <button
        onClick={handleSave}
        className="p-1.5 rounded-lg hover:bg-[#2C8C7C]/10 text-[#2C8C7C]"
      >
        <Check className="w-4 h-4" />
      </button>
    </div>
  ) : (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#2C8C7C]/5 group">
      <button
        className="flex-1 text-left text-[#2C8C7C]"
        onClick={() => signature && onSelect(signature)}
      >
        {signature || "Empty"}
      </button>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 rounded-lg hover:bg-[#2C8C7C]/10 text-[#2C8C7C]"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-[#2C8C7C]/10 text-[#2C8C7C]"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

const SignaturesPanel = ({ isOpen, onClose, signatures, onUpdate }) => {
  const handleUpdateSignature = (index, newValue) => {
    const newSignatures = [...signatures];
    newSignatures[index] = newValue;
    onUpdate(newSignatures);
  };

  const handleDeleteSignature = (index) => {
    const newSignatures = [...signatures];
    newSignatures[index] = "";
    onUpdate(newSignatures);
  };

  return (
    <Panel isOpen={isOpen} onClose={onClose} title="Personal Signatures">
      <div className="w-64 space-y-2">
        {signatures.map((sig, index) => (
          <SignatureItem
            key={index}
            signature={sig}
            onSave={(newValue) => handleUpdateSignature(index, newValue)}
            onDelete={() => handleDeleteSignature(index)}
          />
        ))}
      </div>
    </Panel>
  );
};

const TemplatePanel = ({ isOpen, onClose, onSelect }) => {
  const templates = [
    { name: "Sonnet", desc: "14 lines, traditional rhyme schemes" },
    { name: "Haiku", desc: "3 lines, 5-7-5 syllable pattern" },
    { name: "Free Verse", desc: "Unrestricted form, natural flow" },
    { name: "Villanelle", desc: "19 lines with repeating refrains" },
  ];

  return (
    <Panel isOpen={isOpen} onClose={onClose} title="Choose Template">
      <div className="w-80 grid grid-cols-1 gap-3">
        {templates.map((template) => (
          <button
            key={template.name}
            onClick={() => {
              onSelect(template.name.toLowerCase());
              onClose();
            }}
            className="p-4 rounded-lg border border-[#2C8C7C]/20 
              hover:border-[#2C8C7C]/40 hover:bg-[#2C8C7C]/5
              transition-all duration-300 text-left"
          >
            <div className="text-[#2C8C7C] font-medium">{template.name}</div>
            <p className="mt-1 text-sm text-[#2C8C7C]/60">{template.desc}</p>
          </button>
        ))}
      </div>
    </Panel>
  );
};

const StopWordsPanel = ({ isOpen, onClose, onSelect }) => {
  const stopWords = [
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
    { word: "the", category: "Articles" },
    { word: "a", category: "Articles" },
    { word: "an", category: "Articles" },
    { word: "to", category: "Extras" },
    { word: "from", category: "Extras" },
    { word: "through", category: "Extras" },
  ];

  const categories = [...new Set(stopWords.map((w) => w.category))];

  return (
    <Panel isOpen={isOpen} onClose={onClose} title="Common Words">
      <div className="w-48 space-y-4">
        {categories.map((category) => (
          <div key={category}>
            <h4 className="text-[#2C8C7C]/70 text-sm mb-2">{category}</h4>
            <div className="grid grid-cols-2 gap-2">
              {stopWords
                .filter((w) => w.category === category)
                .map(({ word }) => (
                  <button
                    key={word}
                    onClick={() => onSelect(word)}
                    className="p-2 rounded-lg text-sm hover:bg-[#2C8C7C]/10 
                      text-[#2C8C7C] text-center transition-colors"
                  >
                    {word}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
};

const ConfirmDialog = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop with canvas blur */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Center in the canvas area (excluding toolbar) */}
      <div className="absolute inset-0 right-20 flex items-center justify-center">
        <div
          className="bg-white dark:bg-gray-950 rounded-xl 
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
              onClick={onCancel}
              className="px-4 py-2 rounded-lg hover:bg-[#2C8C7C]/5
                text-[#2C8C7C] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-[#2C8C7C]/10 
                hover:bg-[#2C8C7C]/20 text-[#2C8C7C]
                transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToolBar = ({
  onCapitalizationChange,
  onPunctuationSelect,
  onTemplateToggle,
  onSignatureSelect,
  onPreviewToggle,
  onSave,
  onReset,
  onComplete,
  activeTools = [],
}) => {
  const [openPanel, setOpenPanel] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [signatures, setSignatures] = useState(Array(5).fill(""));

  const handlePanelToggle = (panel) => {
    setOpenPanel(openPanel === panel ? null : panel);
  };

  return (
    <div className="h-full w-20 flex flex-col relative">
      <div className="flex-1 p-4 flex flex-col">
        {/* Text Formatting */}
        <ToolGroup>
          <ToolButton
            icon={Type}
            label="Capitalization"
            onClick={onCapitalizationChange}
            isActive={false}
          />
          <ToolButton
            icon={PenTool}
            label="Punctuation"
            onClick={() => handlePanelToggle("punctuation")}
            isActive={openPanel === "punctuation"}
          />
          <ToolButton
            icon={Hash}
            label="Common Words"
            onClick={() => handlePanelToggle("stopwords")}
            isActive={openPanel === "stopwords"}
          />
        </ToolGroup>

        <ToolSeparator />

        {/* Layout and Templates */}
        <ToolGroup>
          <ToolButton
            icon={Layout}
            label="Choose Template"
            onClick={() => handlePanelToggle("template")}
            isActive={openPanel === "template"}
          />
          <ToolButton
            icon={Star}
            label="Personal Signatures"
            onClick={() => handlePanelToggle("signatures")}
            isActive={openPanel === "signatures"}
          />
        </ToolGroup>

        {/* Preview and Save */}
        <ToolGroup className="mt-auto">
          <ToolSeparator />
          <ToolButton
            icon={RotateCcw}
            label="Reset Canvas"
            onClick={() => setShowResetConfirm(true)}
          />
          <ToolButton
            icon={BookMarked}
            label="Preview Poem"
            onClick={onPreviewToggle}
            isActive={activeTools.includes("preview")}
          />
          <ToolButton icon={Save} label="Save Draft" onClick={onSave} />
          <ToolButton
            icon={ArrowRightCircle}
            label="Complete Poem"
            onClick={onComplete}
          />
        </ToolGroup>
      </div>

      {/* Panels */}
      <PunctuationPanel
        isOpen={openPanel === "punctuation"}
        onClose={() => setOpenPanel(null)}
        onSelect={(symbol) => {
          onPunctuationSelect(symbol);
          setOpenPanel(null);
        }}
      />

      <SignaturesPanel
        isOpen={openPanel === "signatures"}
        onClose={() => setOpenPanel(null)}
        signatures={signatures}
        onUpdate={setSignatures}
        onSelect={(signature) => {
          if (signature.trim()) {
            onSignatureSelect({
              id: `word-${Date.now()}`,
              text: signature,
              type: "word",
              position: {
                x: Math.random() * 100,
                y: Math.random() * 100,
              },
            });
            setOpenPanel(null);
          }
        }}
      />

      <TemplatePanel
        isOpen={openPanel === "template"}
        onClose={() => setOpenPanel(null)}
        onSelect={onTemplateToggle}
      />

      <StopWordsPanel
        isOpen={openPanel === "stopwords"}
        onClose={() => setOpenPanel(null)}
        onSelect={(word) => {
          onPunctuationSelect(word); // Reuse the same handler as it just adds text to canvas
          setOpenPanel(null);
        }}
      />

      <ConfirmDialog
        isOpen={showResetConfirm}
        onConfirm={() => {
          onReset();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};

export default ToolBar;
