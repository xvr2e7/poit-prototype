import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { perlin } from "../../../../utils/animations/animationUtils";

const wordPool = [
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
}));

const FloatingWord = ({ word, onSelect, onInfo, containerSize }) => {
  const elementRef = useRef(null);
  const glowRef = useRef(null);
  const timeRef = useRef(Math.random() * 1000);

  const baseSize = Math.max(120, word.text.length * 15);
  const finalSize = baseSize * word.sizeMultiplier;

  useEffect(() => {
    if (!elementRef.current || !containerSize.width || !containerSize.height)
      return;

    let rafId;

    // Convert percentage to actual position
    const baseX = (word.basePosition.x / 100) * containerSize.width;
    const baseY = (word.basePosition.y / 100) * containerSize.height;

    const animate = () => {
      timeRef.current += 0.003; // Speed of motion
      const time = timeRef.current;

      // Generate smooth, random motion using multiple perlin noise sources
      const xOffset = perlin(time * 0.5) * 150;
      const yOffset = perlin(time * 0.3 + 1000) * 150;

      // Calculate new position
      const x = baseX + xOffset;
      const y = baseY + yOffset;

      // Apply gentle rotation
      const rotation = Math.sin(time * 0.5) * 3;

      // Update position and rotation
      elementRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;

      // Update glow intensity
      if (glowRef.current) {
        const glowIntensity = 0.6 + perlin(time * 0.2) * 0.2;
        glowRef.current.style.opacity = glowIntensity;
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [word, containerSize]);

  return (
    <motion.div
      ref={elementRef}
      className="absolute left-0 top-0"
      whileHover={{ scale: 1.1 }}
      onClick={() => onSelect(word)}
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

      <motion.button
        className="absolute -top-8 left-1/2 transform -translate-x-1/2 p-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-white opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onInfo(word);
        }}
      >
        <Info size={16} />
      </motion.button>
    </motion.div>
  );
};

const WordPool = ({ onWordSelect, onWordInfo }) => {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{ minHeight: "600px" }}
    >
      {containerSize.width > 0 &&
        wordPool.map((word) => (
          <FloatingWord
            key={word.id}
            word={word}
            onSelect={onWordSelect}
            onInfo={onWordInfo}
            containerSize={containerSize}
          />
        ))}
    </div>
  );
};

export default WordPool;
