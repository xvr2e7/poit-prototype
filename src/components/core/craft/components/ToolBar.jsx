import React, { useState } from "react";
import {
  Type,
  PenTool,
  Hash,
  Layout,
  Star,
  RotateCcw,
  BookMarked,
  Crown,
} from "lucide-react";
import { motion } from "framer-motion";
import { ToolButton, ToolSeparator, ToolGroup } from "./ToolBarElements";
import { ToolBarPanels } from "./ToolBarPanels";

const PremiumToolButton = ({ icon: Icon, label, onClick }) => (
  <div className="relative group">
    <ToolButton
      icon={Icon}
      label={label}
      onClick={onClick}
      className="relative z-10"
    />
    <div className="absolute -top-1 -right-1 pointer-events-none">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Crown className="w-4 h-4 text-[#2C8C7C]" />
      </motion.div>
    </div>
  </div>
);

const ToolBar = ({
  onCapitalizationChange,
  onPunctuationSelect,
  onTemplateToggle,
  onSignatureSelect,
  onPreviewToggle,
  onReset,
  activeTools = [],
  isPlayground = false,
  onPremiumFeature,
}) => {
  const [openPanel, setOpenPanel] = useState(null);
  const [signatures, setSignatures] = useState(Array(5).fill(""));

  const handlePanelToggle = (panel) => {
    setOpenPanel(openPanel === panel ? null : panel);
  };

  const handleTemplateSelect = () => {
    if (isPlayground) {
      onPremiumFeature?.("template");
    } else {
      onTemplateToggle();
    }
  };

  const handleSignatureSelect = (signature) => {
    if (isPlayground) {
      onPremiumFeature?.("signature");
    } else {
      onSignatureSelect(signature);
      setOpenPanel(null);
    }
  };

  const handleWordSelect = (word) => {
    onPunctuationSelect(word);
    setOpenPanel(null);
  };

  return (
    <div className="h-full w-20 flex flex-col relative">
      <div className="flex-1 p-4 flex flex-col">
        {/* Basic Tools */}
        <ToolGroup>
          <ToolButton
            icon={Type}
            label="Capitalization"
            onClick={onCapitalizationChange}
            isActive={activeTools.includes("caps")}
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

        {/* Premium Tools */}
        <ToolGroup>
          {isPlayground ? (
            <>
              <PremiumToolButton
                icon={Layout}
                label="Templates"
                onClick={handleTemplateSelect}
              />
              <PremiumToolButton
                icon={Star}
                label="Signatures"
                onClick={handleSignatureSelect}
              />
            </>
          ) : (
            <>
              <ToolButton
                icon={Layout}
                label="Templates"
                onClick={() => handlePanelToggle("template")}
                isActive={openPanel === "template"}
              />
              <ToolButton
                icon={Star}
                label="Signatures"
                onClick={() => handlePanelToggle("signatures")}
                isActive={openPanel === "signatures"}
              />
            </>
          )}
        </ToolGroup>

        {/* Action Tools */}
        <ToolGroup className="mt-auto">
          <ToolSeparator />
          <ToolButton icon={RotateCcw} label="Reset Canvas" onClick={onReset} />
          <ToolButton
            icon={BookMarked}
            label="Preview Poem"
            onClick={onPreviewToggle}
            isActive={activeTools.includes("preview")}
          />
        </ToolGroup>
      </div>

      {/* Panels */}

      <ToolBarPanels.Punctuation
        isOpen={openPanel === "punctuation"}
        onClose={() => setOpenPanel(null)}
        onSelect={handleWordSelect}
      />
      <ToolBarPanels.StopWords
        isOpen={openPanel === "stopwords"}
        onClose={() => setOpenPanel(null)}
        onSelect={handleWordSelect}
      />

      {!isPlayground && (
        <>
          <ToolBarPanels.Template
            isOpen={openPanel === "template"}
            onClose={() => setOpenPanel(null)}
            onSelect={(template) => {
              onTemplateToggle(template);
              setOpenPanel(null);
            }}
          />

          <ToolBarPanels.Signatures
            isOpen={openPanel === "signatures"}
            onClose={() => setOpenPanel(null)}
            signatures={signatures}
            onUpdate={setSignatures}
            onSelect={handleSignatureSelect}
          />
        </>
      )}
    </div>
  );
};

export default ToolBar;
