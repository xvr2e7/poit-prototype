import React, { useState } from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

const wordPool = [
  { id: 1, text: "gentle", type: "adj", depth: 1 },
  { id: 2, text: "whisper", type: "verb", depth: 2 },
  { id: 3, text: "morning", type: "noun", depth: 3 },
  { id: 4, text: "dance", type: "verb", depth: 1 },
  { id: 5, text: "bright", type: "adj", depth: 2 },
  { id: 6, text: "shadow", type: "noun", depth: 3 },
  { id: 7, text: "laugh", type: "verb", depth: 1 },
  { id: 8, text: "quiet", type: "adj", depth: 2 },
  { id: 9, text: "window", type: "noun", depth: 3 },
  { id: 10, text: "dream", type: "verb", depth: 1 },
  { id: 11, text: "soft", type: "adj", depth: 2 },
  { id: 12, text: "breeze", type: "noun", depth: 3 },
  { id: 13, text: "smile", type: "verb", depth: 1 },
  { id: 14, text: "warm", type: "adj", depth: 2 },
  { id: 15, text: "garden", type: "noun", depth: 3 },
  { id: 16, text: "sing", type: "verb", depth: 1 },
  { id: 17, text: "fresh", type: "adj", depth: 2 },
  { id: 18, text: "river", type: "noun", depth: 3 },
  { id: 19, text: "sleep", type: "verb", depth: 1 },
  { id: 20, text: "sweet", type: "adj", depth: 2 },
];

const FloatingWord = ({ word, onSelect, onInfo }) => {
  const [isHovered, setIsHovered] = useState(false);

  const depthStyles = {
    1: { scale: 1.2, blur: "0px", z: 40 },
    2: { scale: 1, blur: "1px", z: 20 },
    3: { scale: 0.8, blur: "2px", z: 0 },
  };

  const { scale, blur, z } = depthStyles[word.depth];

  return (
    <motion.div
      className="absolute"
      animate={{
        x: [0, Math.random() * 30 - 15],
        y: [0, Math.random() * 30 - 15],
      }}
      transition={{
        duration: 10 + Math.random() * 5,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }}
      style={{
        filter: `blur(${blur})`,
        zIndex: z,
      }}
      whileHover={{ scale: 1.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative group">
        <motion.div
          className={`py-2 px-4 rounded-lg backdrop-blur-sm cursor-pointer
            ${isHovered ? "bg-cyan-500/20" : "bg-cyan-500/10"}`}
          animate={{
            opacity: [0.7, 1],
            scale: [1, 1.02],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          onClick={() => onSelect(word)}
        >
          <span className="text-white font-medium">{word.text}</span>
        </motion.div>

        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInfo(word);
              }}
              className="p-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-white"
            >
              <Info size={16} />
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const WordPool = ({ onWordSelect, onWordInfo }) => {
  return (
    <div className="relative w-full h-full">
      {wordPool.map((word, index) => (
        <div
          key={word.id}
          style={{
            position: "absolute",
            left: `${(index % 5) * 20 + Math.random() * 10}%`,
            top: `${Math.floor(index / 5) * 20 + Math.random() * 10}%`,
          }}
        >
          <FloatingWord
            word={word}
            onSelect={onWordSelect}
            onInfo={onWordInfo}
          />
        </div>
      ))}
    </div>
  );
};

export default WordPool;
