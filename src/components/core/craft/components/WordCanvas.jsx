import React from "react";
import WordComposer from "./WordComposer";

const WordCanvas = ({
  words,
  selectedWordId,
  onSelect,
  onMove,
  template,
  preview,
}) => {
  const handleCanvasClick = (e) => {
    // Only deselect if clicking the canvas directly
    if (e.target === e.currentTarget) {
      onSelect?.(null);
    }
  };

  return (
    <div
      className="relative w-full h-[600px] rounded-lg bg-gray-950/20 
        border border-cyan-500/20 overflow-hidden"
      onClick={handleCanvasClick}
    >
      {/* Template guidelines when in preview mode */}
      {preview && template && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 top-1/3 border-t border-cyan-500/10" />
          <div className="absolute inset-x-0 top-2/3 border-t border-cyan-500/10" />
        </div>
      )}

      {/* Words */}
      {words.map((word) => (
        <WordComposer
          key={word.id}
          word={word}
          isSelected={selectedWordId === word.id}
          onSelect={onSelect}
          onMove={onMove}
          preview={preview}
        />
      ))}
    </div>
  );
};

export default WordCanvas;
