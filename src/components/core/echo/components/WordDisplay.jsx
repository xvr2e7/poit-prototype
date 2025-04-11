import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WordComponent = ({
  word,
  isHighlighted,
  glowIntensity = 0,
  onWordClick,
  isTransitioning = false,
  isFloating = false,
  isConnectingWord = false,
}) => {
  const animationDelay = useMemo(() => Math.random() * 4, []);
  const animationDuration = useMemo(() => 4 + Math.random() * 2, []);

  const isInteractive = isHighlighted && glowIntensity > 0;

  return (
    <motion.div
      className="absolute"
      style={{
        left: word.position?.x || 0,
        top: word.position?.y || 0,
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.3 },
      }}
    >
      <motion.div
        className={`
          relative px-3 py-1.5
          group select-none
          transition-all duration-500 ease-out
          ${
            isHighlighted
              ? "text-base scale-110 font-medium"
              : "text-sm font-normal"
          }
          ${isInteractive ? "cursor-pointer hover:scale-115" : "cursor-default"}
          ${isConnectingWord ? "rounded-lg overflow-hidden" : ""}
        `}
        onClick={(e) => isInteractive && onWordClick?.(word, e)}
        whileHover={{ scale: isInteractive ? 1.05 : 1 }}
        animate={
          isFloating
            ? {
                y: [0, -10, 0],
                opacity: [0.7, 1, 0.7],
              }
            : {}
        }
        transition={
          isFloating
            ? {
                y: {
                  duration: animationDuration,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                  delay: animationDelay,
                },
                opacity: {
                  duration: animationDuration * 1.2,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                  delay: animationDelay,
                },
              }
            : {}
        }
      >
        <div
          className={`absolute inset-0 rounded-lg opacity-0 
          ${isInteractive ? "group-hover:opacity-100" : ""}
          bg-[#2C8C7C]/5 dark:bg-[#2C8C7C]/10
          transition-all duration-300`}
        />

        {/* Interactive word styling */}
        {isHighlighted && (
          <motion.div
            className="absolute inset-0 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-radial from-[#2C8C7C]/5 to-transparent opacity-50" />
          </motion.div>
        )}

        {/* Overlay for connecting word */}
        {isConnectingWord && (
          <>
            <motion.div
              className="absolute inset-0 -z-10 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                background:
                  "radial-gradient(circle at center, rgba(44, 140, 124, 0.25) 0%, rgba(44, 140, 124, 0.15) 50%, rgba(44, 140, 124, 0.05) 70%, transparent 100%)",
              }}
            />
            <motion.div
              className="absolute inset-0 -z-10 rounded-lg bg-transparent"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                boxShadow: [
                  "0 0 8px 2px rgba(44, 140, 124, 0.2)",
                  "0 0 12px 4px rgba(44, 140, 124, 0.3)",
                  "0 0 8px 2px rgba(44, 140, 124, 0.2)",
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </>
        )}

        {/* Connection glow for interactive words */}
        {isInteractive && (
          <motion.div
            className="absolute inset-0 -z-10 rounded-lg opacity-0 group-hover:opacity-100"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background: `radial-gradient(
                circle at center,
                rgba(44, 140, 124, ${0.1 + glowIntensity * 0.2}) 0%,
                transparent 70%
              )`,
            }}
          />
        )}

        {/* Word text */}
        <span
          className={`
            relative z-10
            transition-all duration-500 ease-out
            ${
              isHighlighted
                ? "text-[#2C8C7C] dark:text-[#2C8C7C]"
                : "text-gray-600 dark:text-gray-300"
            }
            ${
              isInteractive
                ? "group-hover:text-[#2C8C7C] dark:group-hover:text-[#2C8C7C]"
                : ""
            }
            ${
              isConnectingWord
                ? "font-medium text-[#2C8C7C] dark:text-[#2C8C7C]"
                : ""
            }
            hover:tracking-wide tracking-normal
          `}
        >
          {word.text}
        </span>

        <div
          className={`absolute bottom-0 left-0 right-0 h-px 
          bg-[#2C8C7C]/0 ${isInteractive ? "group-hover:bg-[#2C8C7C]/20" : ""}
          transition-all duration-300`}
        />

        {/* Interactive particles for connected words */}
        {isInteractive && glowIntensity > 0.3 && (
          <div
            className="absolute inset-0 pointer-events-none opacity-0 
            group-hover:opacity-100 transition-opacity duration-300"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-0.5 rounded-full bg-[#2C8C7C]/40"
                style={{
                  left: `${50 + Math.cos((i * Math.PI * 2) / 3) * 15}%`,
                  top: `${50 + Math.sin((i * Math.PI * 2) / 3) * 15}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        )}
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
  isFloating = false,
  className = "",
  connectingWord = null,
}) => {
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
            isFloating={isFloating}
            isConnectingWord={
              connectingWord &&
              word.text.toLowerCase() === connectingWord.toLowerCase()
            }
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default WordDisplay;
