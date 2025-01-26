import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";

const Word = ({
  word,
  position,
  depth,
  scale = 1,
  rotation = 0,
  isSelected,
  onSelect,
}) => {
  const springConfig = { damping: 20, stiffness: 300 };
  const x = useSpring(position.x, springConfig);
  const y = useSpring(position.y, springConfig);
  const baseScale = useSpring(scale, springConfig);
  const baseRotation = useSpring(rotation, springConfig);

  const opacity = useTransform(useMotionValue(depth), [0, 1], [0.4, 1]);
  const blur = useTransform(useMotionValue(depth), [0, 1], [2, 0]);
  const shadowOpacity = useTransform(useMotionValue(depth), [0, 1], [0.1, 0.3]);

  return (
    <motion.div
      className="absolute select-none cursor-move"
      style={{
        x,
        y,
        scale: baseScale,
        rotate: baseRotation,
        opacity,
        filter: blur.get() ? `blur(${blur.get()}px)` : "none",
      }}
      whileHover={{ scale: scale * 1.05 }}
      onClick={() => onSelect(word.id)}
    >
      <div className={`relative p-2 ${isSelected ? "z-10" : ""}`}>
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background: `radial-gradient(circle at 50% 50%, 
              rgba(147, 197, 253, ${shadowOpacity.get()}),
              transparent 70%)`,
          }}
        />

        <div
          className={`text-white font-medium px-4 py-2 backdrop-blur-sm
            ${depth > 0.7 ? "text-4xl" : depth > 0.4 ? "text-2xl" : "text-xl"}`}
        >
          {word.content}
        </div>

        {isSelected && (
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-cyan-400"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
          />
        )}
      </div>
    </motion.div>
  );
};

const WordCanvas = ({ words, onWordMove, onWordSelect }) => {
  const [selectedWord, setSelectedWord] = useState(null);
  const containerRef = useRef(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    const interval = setInterval(() => {
      words.forEach((word) => {
        if (word.id !== selectedWord) {
          onWordMove(word.id, {
            x: word.position.x + (Math.random() - 0.5) * 2,
            y: word.position.y + (Math.random() - 0.5) * 2,
          });
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedWord, words, onWordMove]);

  return (
    <DndContext sensors={sensors}>
      <div
        ref={containerRef}
        className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-transparent to-blue-900/10"
      >
        <AnimatePresence>
          {words.map((word) => (
            <Word
              key={word.id}
              word={word}
              position={word.position}
              depth={word.depth}
              scale={word.scale}
              rotation={word.rotation}
              isSelected={selectedWord === word.id}
              onSelect={(id) => {
                setSelectedWord(id);
                onWordSelect?.(id);
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </DndContext>
  );
};

export default WordCanvas;
