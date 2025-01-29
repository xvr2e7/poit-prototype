import React, { useMemo } from "react";
import { motion } from "framer-motion";

const WordComponent = ({ word, isHighlighted }) => {
  return (
    <motion.div
      className="absolute"
      style={{
        left: word.position?.x || 0,
        top: word.position?.y || 0,
      }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        scale: isHighlighted ? [1, 1.05, 1] : 1,
      }}
      transition={{
        scale: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      <div
        className={`
        relative px-4 py-2 rounded-lg backdrop-blur-sm transition-all
        ${
          isHighlighted
            ? "bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30"
            : "bg-white/5 text-cyan-200/70 hover:bg-white/10"
        }
      `}
      >
        {/* Ambient glow for highlighted words */}
        {isHighlighted && (
          <div
            className="absolute inset-0 -z-10 rounded-lg opacity-50 transition-opacity"
            style={{
              background: `radial-gradient(circle at center,
                rgba(34, 211, 238, 0.3) 0%,
                rgba(34, 211, 238, 0) 70%
              )`,
              transform: "scale(1.5)",
            }}
          />
        )}

        <span className="relative z-10 select-none pointer-events-none">
          {word.text}
        </span>
      </div>
    </motion.div>
  );
};

const SpatialWords = ({
  words = [],
  highlightedWords = [],
  className = "",
}) => {
  // Create a Set of highlighted words for quick lookup
  const highlightedWordSet = useMemo(
    () => new Set(highlightedWords.map((w) => w.toLowerCase())),
    [highlightedWords]
  );

  return (
    <div className={`relative w-full h-full ${className}`}>
      {words.map((word, index) => (
        <WordComponent
          key={`${word.text}-${index}`}
          word={word}
          isHighlighted={highlightedWordSet.has(word.text.toLowerCase())}
        />
      ))}
    </div>
  );
};

export default SpatialWords;
