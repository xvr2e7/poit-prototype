import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { Info } from "lucide-react";
import { perlin } from "../../../../utils/animations/animationUtils";

// Test words array
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
];

const BioluminescentWord = ({ word, onSelect, onInfo, mousePosition }) => {
  const controls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    let rafId;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Random initial position for the word
    const initialX = Math.random() * screenWidth;
    const initialY = Math.random() * screenHeight;

    const animate = () => {
      if (!ref.current) return;
      timeRef.current += 0.001;

      // Dynamic movement using Perlin noise
      const xNoise = perlin(timeRef.current + word.id * 100);
      const yNoise = perlin(timeRef.current + word.id * 200);

      // Update position with noise and initial offset
      const x = initialX + xNoise * 300;
      const y = initialY + yNoise * 300;

      // Apply movement to the word
      ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      rafId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafId);
  }, [word]);

  return (
    <motion.div
      ref={ref}
      className="absolute"
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <svg
        viewBox="-50 -50 100 100"
        width={word.text.length * 10}
        height={word.text.length * 10}
        onClick={() => onSelect(word)}
      >
        <defs>
          <radialGradient id={`glow-${word.id}`}>
            <stop offset="0%" stopColor="rgba(147, 197, 253, 0.8)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </radialGradient>
        </defs>

        <circle
          r="40"
          fill={`url(#glow-${word.id})`}
          className="transition-opacity duration-300"
          style={{ opacity: isHovered ? 0.9 : 0.7 }}
        />

        <text
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-white pointer-events-none select-none"
          style={{ fontSize: Math.max(8, 20 - word.text.length) }}
        >
          {word.text}
        </text>
      </svg>

      {isHovered && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 p-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-white"
          onClick={(e) => {
            e.stopPropagation();
            onInfo(word);
          }}
        >
          <Info size={16} />
        </motion.button>
      )}
    </motion.div>
  );
};

const WordPool = ({ onWordSelect, onWordInfo }) => {
  const [mousePosition, setMousePosition] = useState(null);
  const poolRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!poolRef.current) return;
      const rect = poolRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={poolRef}
      className="relative w-full h-full"
      style={{ minHeight: "600px" }}
    >
      {wordPool.map((word) => (
        <BioluminescentWord
          key={word.id}
          word={word}
          onSelect={onWordSelect}
          onInfo={onWordInfo}
          mousePosition={mousePosition}
        />
      ))}
    </div>
  );
};

export default WordPool;
