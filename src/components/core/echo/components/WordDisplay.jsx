import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WordComponent = ({
  word,
  isHighlighted,
  glowIntensity = 0,
  onWordClick,
  isTransitioning = false,
}) => {
  return (
    <motion.div
      className="absolute"
      style={{
        left: word.position?.x || 0,
        top: word.position?.y || 0,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4 },
      }}
      exit={{
        opacity: 0,
        scale: 0.8,
        transition: { duration: 0.3 },
      }}
      whileHover={glowIntensity > 0 ? { scale: 1.05 } : undefined}
    >
      <motion.div
        className={`
          relative px-4 py-2 rounded-lg backdrop-blur-sm transition-all
          ${glowIntensity > 0 ? "cursor-pointer" : ""}
          ${
            isHighlighted
              ? "bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30"
              : "bg-white/5 text-cyan-200/70 hover:bg-white/10"
          }
        `}
        onClick={() => glowIntensity > 0 && onWordClick?.(word)}
      >
        {/* Base highlight for word pool words */}
        {isHighlighted && (
          <div
            className="absolute inset-0 -z-10 rounded-lg"
            style={{
              background: `
                radial-gradient(
                  circle at center,
                  rgba(34, 211, 238, 0.4) 0%,
                  rgba(34, 211, 238, 0.2) 40%,
                  rgba(34, 211, 238, 0) 70%
                )
              `,
              transform: "scale(1.5)",
              opacity: 0.6,
            }}
          />
        )}

        {/* Additional glow for shared words */}
        {glowIntensity > 0 && (
          <motion.div
            className="absolute inset-0 -z-20 rounded-lg"
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [1.8, 2, 1.8],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background: `
                radial-gradient(
                  circle at center,
                  rgba(56, 189, 248, ${0.3 + glowIntensity * 0.4}) 0%,
                  rgba(56, 189, 248, ${0.2 + glowIntensity * 0.3}) 40%,
                  rgba(56, 189, 248, 0) 70%
                )
              `,
            }}
          />
        )}

        <span className="relative z-10 select-none pointer-events-none font-medium">
          {word.text}
        </span>
      </motion.div>
    </motion.div>
  );
};

const WordDisplay = ({
  words = [],
  highlightedWords = [],
  getWordGlowIntensity,
  onWordClick,
  isTransitioning = false,
  className = "",
}) => {
  // Create a Set of highlighted words for quick lookup
  const highlightedWordSet = useMemo(
    () => new Set(highlightedWords.map((w) => w.toLowerCase())),
    [highlightedWords]
  );

  return (
    <div className={`relative w-full h-full ${className}`}>
      <AnimatePresence mode="sync">
        {words.map((word) => (
          <WordComponent
            key={`${word.id || word.text}-${word.position?.x}-${
              word.position?.y
            }`}
            word={word}
            isHighlighted={highlightedWordSet.has(word.text.toLowerCase())}
            glowIntensity={getWordGlowIntensity?.(word.text) || 0}
            onWordClick={onWordClick}
            isTransitioning={isTransitioning}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default WordDisplay;
