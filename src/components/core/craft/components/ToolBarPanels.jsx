import React, { useState } from "react";
import { Edit2, Check, X } from "lucide-react";
import { Panel } from "./ToolBarElements";

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

export const ToolBarPanels = {
  Punctuation: ({ isOpen, onClose, onSelect }) => {
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
  },

  Signatures: ({ isOpen, onClose, signatures, onUpdate, onSelect }) => {
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
              onSelect={onSelect}
            />
          ))}
        </div>
      </Panel>
    );
  },

  Template: ({ isOpen, onClose, onSelect }) => {
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
  },

  StopWords: ({ isOpen, onClose, onSelect }) => {
    const stopWords = [
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
        <div className="w-96 space-y-4">
          {categories.map((category) => (
            <div key={category}>
              <h4 className="text-[#2C8C7C]/70 text-sm mb-2">{category}</h4>
              <div className="grid grid-cols-4 gap-2">
                {stopWords
                  .filter((w) => w.category === category)
                  .map(({ word }) => (
                    <button
                      key={word}
                      onClick={() => onSelect(word)}
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
      </Panel>
    );
  },
};
