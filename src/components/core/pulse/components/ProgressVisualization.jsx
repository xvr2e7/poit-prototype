import React from "react";
import { motion } from "framer-motion";
import { useWindowSize } from "../../../../utils/hooks/useWindowSize";

export const ProgressVisualization = ({
  words,
  selectedWords,
  currentIndex,
}) => {
  const { isMobile } = useWindowSize();

  if (isMobile) {
    return (
      <div className="w-full px-4 py-2">
        <div className="flex justify-between items-center">
          {words.map((word, i) => {
            const status =
              i < currentIndex
                ? selectedWords.includes(word)
                  ? "selected"
                  : "discarded"
                : i === currentIndex
                ? "current"
                : "pending";

            return (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: i === currentIndex ? 1.2 : 1,
                  opacity: 1,
                }}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  status === "selected"
                    ? "bg-green-500"
                    : status === "discarded"
                    ? "bg-red-500"
                    : status === "current"
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full"
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform="translate(400, 280)">
          {/* Connection lines */}
          <g className="text-gray-200 opacity-20">
            {words.map((_, i) => {
              if (i === 0) return null;
              const angle1 = Math.PI * ((i - 1) / (words.length - 1)) - Math.PI;
              const angle2 = Math.PI * (i / (words.length - 1)) - Math.PI;
              const x1 = Math.cos(angle1) * 300;
              const y1 = Math.sin(angle1) * 180;
              const x2 = Math.cos(angle2) * 300;
              const y2 = Math.sin(angle2) * 180;

              return (
                <motion.line
                  key={`line-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className="stroke-current"
                  strokeWidth={0.5}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                />
              );
            })}
          </g>

          {/* Points */}
          {words.map((word, i) => {
            const angle = Math.PI * (i / (words.length - 1)) - Math.PI;
            const x = Math.cos(angle) * 300;
            const y = Math.sin(angle) * 180;
            const status =
              i < currentIndex
                ? selectedWords.includes(word)
                  ? "selected"
                  : "discarded"
                : i === currentIndex
                ? "current"
                : "pending";

            return (
              <g key={`point-${i}`}>
                <motion.circle
                  cx={x}
                  cy={y}
                  r={4}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: i === currentIndex ? 1.5 : 1,
                    opacity: 1,
                  }}
                  className={`transform origin-center transition-colors duration-300 ${
                    status === "selected"
                      ? "fill-green-500"
                      : status === "discarded"
                      ? "fill-red-500"
                      : status === "current"
                      ? "fill-blue-500"
                      : "fill-gray-300"
                  }`}
                />
                {i === currentIndex && (
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={12}
                    className="fill-blue-500 opacity-10"
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
