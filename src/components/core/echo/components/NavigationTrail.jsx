import React from "react";
import { motion } from "framer-motion";

export const NavigationTrail = ({
  visitedPoems,
  onPoemSelect,
  currentPoemId,
}) => {
  return (
    <motion.div
      className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {visitedPoems.map((poem, index) => (
        <motion.div
          key={poem.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          {/* Connection Line */}
          {index < visitedPoems.length - 1 && (
            <motion.div
              className="absolute left-1/2 top-full h-2 w-px -translate-x-1/2"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              style={{
                background:
                  "linear-gradient(to bottom, rgba(44,140,124,0.2), transparent)",
              }}
            />
          )}

          {/* Navigation Node */}
          <motion.button
            onClick={() => onPoemSelect(poem.id)}
            className="group relative"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Node Circle */}
            <div
              className={`
              w-2 h-2 rounded-full border transition-all duration-300
              ${
                poem.id === currentPoemId
                  ? "border-[#2C8C7C] bg-[#2C8C7C]/20"
                  : "border-[#2C8C7C]/30 group-hover:border-[#2C8C7C]"
              }
            `}
            >
              {/* Glow effect for current poem */}
              {poem.id === currentPoemId && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-[#2C8C7C]/20"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </div>

            {/* Title Preview */}
            <div
              className="absolute left-full ml-3 top-1/2 -translate-y-1/2 
              pointer-events-none"
            >
              <div
                className="px-3 py-1.5 rounded-lg whitespace-nowrap
                opacity-0 group-hover:opacity-100 transition-opacity duration-300
                bg-white/5 dark:bg-gray-950/30 backdrop-blur-sm
                border border-[#2C8C7C]/20"
              >
                <span className="text-sm text-[#2C8C7C]">{poem.title}</span>
              </div>
            </div>
          </motion.button>
        </motion.div>
      ))}
    </motion.div>
  );
};
