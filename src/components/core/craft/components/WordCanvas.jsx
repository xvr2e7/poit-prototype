import React from "react";
import WordComposer from "./WordComposer";

const WordCanvas = ({
  words,
  selectedWordId,
  onSelect,
  onMove,
  onReturn,
  template,
  preview,
  capitalizationMode,
}) => {
  const handleCanvasClick = (e) => {
    if (e.target === e.currentTarget) {
      onSelect?.(null);
    }
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onClick={handleCanvasClick}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#2C8C7C0A_1px,transparent_1px),linear-gradient(to_bottom,#2C8C7C0A_1px,transparent_1px)]
        bg-[size:24px_24px]"
      />

      {/* Template guidelines when in preview mode */}
      {preview && template && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-x-6 top-1/3 h-px bg-gradient-to-r 
            from-[#2C8C7C]/0 via-[#2C8C7C]/10 to-[#2C8C7C]/0"
          />
          <div
            className="absolute inset-x-6 top-2/3 h-px bg-gradient-to-r 
            from-[#2C8C7C]/0 via-[#2C8C7C]/10 to-[#2C8C7C]/0"
          />

          {/* Guide markers */}
          {[0, 1, 2].map((i) => (
            <React.Fragment key={i}>
              <div
                className="absolute left-6 w-1 h-1 rounded-full bg-[#2C8C7C]/20"
                style={{ top: `${i * 33.33 + 1}%` }}
              />
              <div
                className="absolute right-6 w-1 h-1 rounded-full bg-[#2C8C7C]/20"
                style={{ top: `${i * 33.33 + 1}%` }}
              />
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Words and Punctuation */}
      {words.map((word) => (
        <WordComposer
          key={word.id}
          word={{
            ...word,
            text: word.text || word.content, // Handle both text and content properties
          }}
          isSelected={selectedWordId === word.id}
          onSelect={onSelect}
          onMove={onMove}
          onReturn={onReturn}
          preview={preview}
          capitalizationMode={capitalizationMode}
        />
      ))}

      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#2C8C7C]/10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${
                3 + Math.random() * 4
              }s infinite ease-in-out ${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default WordCanvas;
