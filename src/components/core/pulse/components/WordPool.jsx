import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { perlin } from "../../../../utils/animations/animationUtils";

const wordPool = [
  { id: 1, text: "microwave", type: "noun", depth: 1 },
  { id: 2, text: "fidget", type: "verb", depth: 2 },
  { id: 3, text: "sneaker", type: "noun", depth: 3 },
  { id: 4, text: "grumpy", type: "adj", depth: 1 },
  { id: 5, text: "buffering", type: "verb", depth: 2 },
  { id: 6, text: "doorknob", type: "noun", depth: 3 },
  { id: 7, text: "slouch", type: "verb", depth: 1 },
  { id: 8, text: "glitch", type: "verb", depth: 2 },
  { id: 9, text: "squeaky", type: "adj", depth: 3 },
  { id: 10, text: "deadline", type: "noun", depth: 1 },
  { id: 11, text: "crumple", type: "verb", depth: 2 },
  { id: 12, text: "sticky", type: "adj", depth: 3 },
  { id: 13, text: "upload", type: "verb", depth: 1 },
  { id: 14, text: "awkward", type: "adj", depth: 2 },
  { id: 15, text: "pixel", type: "noun", depth: 3 },
  { id: 16, text: "sprint", type: "verb", depth: 1 },
  { id: 17, text: "crispy", type: "adj", depth: 2 },
  { id: 18, text: "coffee", type: "noun", depth: 3 },
  { id: 19, text: "restless", type: "adj", depth: 1 },
  { id: 20, text: "inbox", type: "noun", depth: 2 },
];

const FloatingWord = ({ word, onSelect, onInfo }) => {
  const [isHovered, setIsHovered] = useState(false);
  const elementRef = useRef(null);
  const timeOffset = useRef(Math.random() * 10000).current;
  
  // Full viewport range for initial positions
  const basePosition = useRef({
    x: Math.random() * 100, // Using percentage of viewport
    y: Math.random() * 100,
    z: Math.random() * 1000 - 500
  }).current;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let animationFrameId;
    let startTime = performance.now();

    const animate = () => {
      const currentTime = (performance.now() - startTime) * 0.00005;
      
      // Wider range for movement (50% of viewport)
      const xOffset = perlin(currentTime + timeOffset) * 50;
      const yOffset = perlin(currentTime + timeOffset + 1000) * 50;
      const zOffset = perlin(currentTime + timeOffset + 2000) * 100;

      // Add gentle swaying with larger amplitude
      const swayX = Math.sin(currentTime * 0.1 + timeOffset) * 25;
      const swayY = Math.cos(currentTime * 0.08 + timeOffset) * 25;

      // Wrap around edges to ensure words stay in viewport
      const x = ((basePosition.x + xOffset + swayX + 100) % 100);
      const y = ((basePosition.y + yOffset + swayY + 100) % 100);
      const z = zOffset;

      const scale = mapRange(z, -500, 500, 1.5, 2.5);
      const blur = Math.abs(mapRange(z, -500, 500, 0, 1.5));
      const opacity = mapRange(Math.abs(z), 0, 500, 1, 0.3);
      
      element.style.transform = `translate3d(${x}vw, ${y}vh, ${z}px) scale(${scale})`;
      element.style.filter = `blur(${blur}px)`;
      element.style.opacity = opacity;
      element.style.zIndex = Math.round(1000 - z);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [timeOffset]);

  return (
    <motion.div
      ref={elementRef}
      className="absolute text-xl"
      style={{
        left: 0,
        top: 0,
        perspective: 1000,
        backfaceVisibility: 'hidden',
        transformStyle: 'preserve-3d',
        willChange: 'transform, opacity, filter'
      }}
      whileHover={{ scale: 1.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative group">
        <motion.div
          className={`py-3 px-6 rounded-lg backdrop-blur-sm cursor-pointer
            ${isHovered ? "bg-cyan-500/20" : "bg-cyan-500/10"}`}
          animate={{
            opacity: [0.7, 1],
            scale: [1, 1.02],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "mirror",
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

const mapRange = (value, inMin, inMax, outMin, outMax) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

const WordPool = ({ onWordSelect, onWordDiscard }) => {
  return (
    <div 
      className="fixed inset-0 overflow-hidden"
      style={{ 
        perspective: 1000,
        transformStyle: 'preserve-3d'
      }}
    >
      {wordPool.map((word) => (
        <FloatingWord
          key={word.id}
          word={word}
          onSelect={onWordSelect}
          onInfo={onWordDiscard}
        />
      ))}
    </div>
  );
};

export default WordPool;