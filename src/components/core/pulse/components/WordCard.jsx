import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useWordAnimation } from "../hooks/useWordAnimation";

const WordCard = ({ word, onKeep, onDiscard }) => {
  const { controls, position, glow, handlers, variants } = useWordAnimation();

  // Handle drag gestures with fluid animation
  const handleDragEnd = (event, info) => {
    const { offset, velocity } = info;
    const swipe = Math.abs(velocity.x) * 2;
    const dragThreshold = swipe > 1000 ? 50 : 100;

    if (Math.abs(offset.x) > dragThreshold) {
      const direction = offset.x > 0;
      controls.start("exit", {
        direction: direction ? 1 : -1,
        onComplete: () => (direction ? onKeep() : onDiscard()),
      });
    } else {
      controls.start("ambient");
    }
  };

  return (
    <motion.div className="relative w-full max-w-lg mx-auto">
      {/* Bioluminescent glow effect */}
      <motion.div
        className="absolute inset-0 bg-[#4dffd2] rounded-xl filter blur-xl"
        style={{
          opacity: glow.opacity,
          scale: glow.scale,
        }}
      />

      {/* Main word card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        onDragEnd={handleDragEnd}
        animate={controls}
        variants={variants}
        style={{
          x: position.x,
          y: position.y,
          rotate: position.rotation,
        }}
        {...handlers}
        className="relative bg-[#1a1f3d] rounded-xl shadow-xl overflow-hidden"
      >
        {/* Water gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent" />

        {/* Content */}
        <div className="p-8 flex flex-col items-center justify-center min-h-[200px]">
          <motion.h2
            className="text-4xl font-bold text-white mb-4"
            animate={{
              opacity: [0.8, 1],
              scale: [0.98, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {word}
          </motion.h2>

          <div className="text-cyan-300/60 text-sm mt-4">
            Swipe right to keep, left to discard
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WordCard;
