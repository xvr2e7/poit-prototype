import React, { useState } from "react";
import {
  Type,
  PenTool,
  Hash,
  Layout,
  Star,
  RotateCcw,
  BookMarked,
  Save,
  ArrowRightCircle,
} from "lucide-react";

import { ToolButton, ToolSeparator, ToolGroup } from "./ToolBarElements";

import { ToolBarPanels } from "./ToolBarPanels";

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
  const [signatures, setSignatures] = useState(Array(5).fill(""));

  const handlePanelToggle = (panel) => {
    setOpenPanel(openPanel === panel ? null : panel);
  };

  const handleSignatureSelect = (signature) => {
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
  };

  const handleWordSelect = (word) => {
    onPunctuationSelect(word);
    setOpenPanel(null);
  };

  return (
    <div className="h-full w-20 flex flex-col relative">
      {/* Main Toolbar Content */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Text Formatting Tools */}
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

        {/* Layout Tools */}
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
          {onSave && (
            <ToolButton icon={Save} label="Save Draft" onClick={onSave} />
          )}
          <ToolButton
            icon={ArrowRightCircle}
            label="Complete Poem"
            onClick={onComplete}
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
    </div>
  );
};

export default ToolBar;
