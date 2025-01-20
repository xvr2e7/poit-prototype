import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { perlin } from "../../../../utils/animations/animationUtils";

const FloatingWord = ({ word, isSelected, onPositionUpdate }) => {
  const elementRef = useRef(null);
  const glowRef = useRef(null);
  const timeRef = useRef(Math.random() * 1000);

  const baseSize = Math.max(120, word.text.length * 15);
  const finalSize = baseSize * word.sizeMultiplier;

  useEffect(() => {
    if (!elementRef.current) return;

    let rafId;

    const baseX = (word.basePosition.x / 100) * window.innerWidth;
    const baseY = (word.basePosition.y / 100) * window.innerHeight;

    const animate = () => {
      timeRef.current += 0.003;
      const time = timeRef.current;

      const xOffset = perlin(time * 0.5) * 150;
      const yOffset = perlin(time * 0.3 + 1000) * 150;

      const x = baseX + xOffset;
      const y = baseY + yOffset;

      const rotation = Math.sin(time * 0.5) * 3;

      elementRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;

      if (glowRef.current) {
        const glowIntensity = 0.6 + perlin(time * 0.2) * 0.2;
        glowRef.current.style.opacity = glowIntensity;
      }

      if (!isSelected) {
        onPositionUpdate(word.id, elementRef.current.getBoundingClientRect());
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [word, isSelected, onPositionUpdate]);

  return (
    <motion.div
      ref={elementRef}
      className="absolute left-0 top-0"
      initial={{ opacity: 1, scale: 1 }}
      animate={
        isSelected
          ? {
              opacity: [1, 0.8, 0],
              scale: [1, 1.2, 0],
              transition: { duration: 0.5, ease: "easeInOut" },
            }
          : {
              opacity: 1,
              scale: 1,
            }
      }
    >
      <svg viewBox="-50 -50 100 100" width={finalSize} height={finalSize}>
        <defs>
          <radialGradient id={`glow-${word.id}`}>
            <stop offset="0%" stopColor="rgba(147, 197, 253, 0.8)" />
            <stop offset="40%" stopColor="rgba(147, 197, 253, 0.3)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </radialGradient>
        </defs>

        <circle
          ref={glowRef}
          r="40"
          fill={`url(#glow-${word.id})`}
          className="transition-opacity duration-300"
        />

        <text
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-white pointer-events-none select-none"
          style={{
            fontSize: Math.max(12, 24 - word.text.length * 0.8),
            fontWeight: 500,
          }}
        >
          {word.text}
        </text>
      </svg>
    </motion.div>
  );
};

const WordPool = ({ selectedWords = [], onPositionUpdate }) => {
  const [words] = useState(
    [
      { id: 1, text: "microwave", type: "noun" },
      { id: 2, text: "fidget", type: "verb" },
      { id: 3, text: "sneaker", type: "noun" },
      { id: 4, text: "grumpy", type: "adj" },
      { id: 5, text: "buffering", type: "verb" },
      { id: 6, text: "doorknob", type: "noun" },
      { id: 7, text: "slouch", type: "verb" },
      { id: 8, text: "glitch", type: "verb" },
      { id: 9, text: "squeaky", type: "adj" },
      { id: 10, text: "deadline", type: "noun" },
      { id: 11, text: "crumple", type: "verb" },
      { id: 12, text: "sticky", type: "adj" },
      { id: 13, text: "upload", type: "verb" },
      { id: 14, text: "awkward", type: "adj" },
      { id: 15, text: "pixel", type: "noun" },
      { id: 16, text: "sprint", type: "verb" },
      { id: 17, text: "crispy", type: "adj" },
      { id: 18, text: "coffee", type: "noun" },
      { id: 19, text: "restless", type: "adj" },
      { id: 20, text: "inbox", type: "noun" },
    ].map((word) => ({
      ...word,
      sizeMultiplier: 1 + Math.random() * 0.5,
      basePosition: {
        x: Math.random() * 100,
        y: Math.random() * 100,
      },
    }))
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {words.map((word) => (
          <FloatingWord
            key={word.id}
            word={word}
            isSelected={selectedWords.includes(word.id)}
            onPositionUpdate={onPositionUpdate}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default WordPool;
