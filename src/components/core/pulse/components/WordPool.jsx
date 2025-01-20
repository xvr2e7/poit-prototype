import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { perlin } from "../../../../utils/animations/animationUtils";

const WORD_LIST = [
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
];

const FloatingWord = ({
  word,
  isSelected,
  interactingWord,
  interactionProgress,
  onPositionUpdate,
}) => {
  const elementRef = useRef(null);
  const glowRef = useRef(null);
  const timeRef = useRef(Math.random() * 1000);
  const [isAbsorbed, setIsAbsorbed] = useState(false);
  const isInteracting = interactingWord === word.id;
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

      // Base movement with perlin noise
      const xOffset = perlin(time * 0.5) * 150;
      const yOffset = perlin(time * 0.3 + 1000) * 150;

      let x = baseX + xOffset;
      let y = baseY + yOffset;

      // Add interaction effects
      if (isInteracting && !isAbsorbed) {
        // Add slight movement towards selector during interaction
        const wobble = Math.sin(time * 5) * (5 * interactionProgress);
        const drift = Math.cos(time * 3) * (5 * interactionProgress);
        x += wobble;
        y += drift;
      }

      elementRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${
        Math.sin(time * 0.5) * 3
      }deg)`;

      if (glowRef.current) {
        // Base glow with perlin noise variation
        const baseGlow = 0.6 + perlin(time * 0.2) * 0.2;
        // Add interaction glow
        const interactionGlow = isInteracting ? interactionProgress * 0.4 : 0;
        glowRef.current.style.opacity = baseGlow + interactionGlow;
      }

      if (!isAbsorbed) {
        onPositionUpdate(word.id, elementRef.current.getBoundingClientRect());
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [word, isAbsorbed, isInteracting, interactionProgress, onPositionUpdate]);

  // Watch for selection completion
  useEffect(() => {
    if (isSelected && !isAbsorbed) {
      setIsAbsorbed(true);
    }
  }, [isSelected]);

  return (
    <motion.div
      ref={elementRef}
      className="absolute left-0 top-0"
      initial={{ opacity: 1, scale: 1 }}
      animate={
        isAbsorbed
          ? {
              opacity: [1, 0.8, 0],
              scale: [1, 1.2, 0],
              transition: {
                duration: 0.5,
                ease: "easeInOut",
                times: [0, 0.3, 1],
              },
            }
          : {
              opacity: 1,
              scale: 1 + (isInteracting ? interactionProgress * 0.2 : 0),
              transition: { duration: 0.3 },
            }
      }
    >
      <svg viewBox="-50 -50 100 100" width={finalSize} height={finalSize}>
        <defs>
          {/* Base glow gradient */}
          <radialGradient id={`glow-${word.id}`}>
            <stop
              offset="0%"
              stopColor={`rgba(147, 197, 253, ${isInteracting ? 0.9 : 0.8})`}
            />
            <stop
              offset="40%"
              stopColor={`rgba(147, 197, 253, ${isInteracting ? 0.4 : 0.3})`}
            />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </radialGradient>

          {/* Interaction progress gradient */}
          {isInteracting && (
            <radialGradient id={`progress-${word.id}`}>
              <stop offset="0%" stopColor="rgba(147, 197, 253, 0.3)" />
              <stop
                offset={`${interactionProgress * 100}%`}
                stopColor="rgba(147, 197, 253, 0.1)"
              />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
            </radialGradient>
          )}
        </defs>

        {/* Progress ring */}
        {isInteracting && (
          <circle
            r="45"
            fill={`url(#progress-${word.id})`}
            className="transition-opacity duration-300"
          />
        )}

        {/* Base glow */}
        <circle
          ref={glowRef}
          r="40"
          fill={`url(#glow-${word.id})`}
          className="transition-opacity duration-300"
        />

        {/* Word text */}
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

        {/* Additional interaction particles */}
        {isInteracting && (
          <g>
            {[...Array(5)].map((_, i) => {
              const angle = (i / 5) * Math.PI * 2;
              const x = Math.cos(angle) * 30 * interactionProgress;
              const y = Math.sin(angle) * 30 * interactionProgress;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={1 + Math.random()}
                  fill="rgba(147, 197, 253, 0.6)"
                  className="animate-pulse"
                />
              );
            })}
          </g>
        )}
      </svg>
    </motion.div>
  );
};

const WordPool = ({
  selectedWords = [],
  onPositionUpdate,
  interactingWord,
  interactionProgress,
}) => {
  const [words] = useState(
    WORD_LIST.map((word) => ({
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
            interactingWord={interactingWord}
            interactionProgress={interactionProgress}
            onPositionUpdate={onPositionUpdate}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default WordPool;
