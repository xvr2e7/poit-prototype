import React, { useCallback } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Check, X } from "lucide-react";

export const WordCard = ({ word, onKeep, onDiscard }) => {
  // Motion values for dynamic transitions
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 0, 150], [-15, 0, 15]);
  const scale = useTransform(x, [-150, 0, 150], [0.8, 1, 0.8]);

  // Transform opacity for the action buttons based on drag
  const keepOpacity = useTransform(x, [-100, 0, 100], [0, 1, 1]);
  const discardOpacity = useTransform(x, [-100, 0, 100], [1, 1, 0]);

  // Background color shifts based on drag direction
  const background = useTransform(
    x,
    [-150, -50, 0, 50, 150],
    [
      "rgba(239, 68, 68, 0.1)", // Red tint
      "rgba(239, 68, 68, 0.05)",
      "rgba(255, 255, 255, 1)", // White
      "rgba(34, 197, 94, 0.05)",
      "rgba(34, 197, 94, 0.1)", // Green tint
    ]
  );

  // Enhanced drag end handler with velocity detection
  const handleDragEnd = useCallback(
    (_, info) => {
      const velocity = info.velocity.x;
      const offset = info.offset.x;

      // If the velocity is high enough, trigger the action even with less drag
      if (Math.abs(velocity) >= 500) {
        velocity > 0 ? onKeep() : onDiscard();
        return;
      }

      // Otherwise, check the offset against a threshold
      if (Math.abs(offset) >= 100) {
        offset > 0 ? onKeep() : onDiscard();
      }
    },
    [onKeep, onDiscard]
  );

  return (
    <motion.div
      style={{
        x,
        rotate,
        scale,
        background,
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7} // Add some resistance to the drag
      onDragEnd={handleDragEnd}
      className="absolute w-full max-w-lg rounded-xl shadow-xl p-8 cursor-grab active:cursor-grabbing"
    >
      <div className="flex flex-col items-center justify-center min-h-[200px] relative">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">{word}</h2>

        <div className="flex items-center justify-between w-full mt-6">
          {/* Keep buttons visible but fade based on drag */}
          <motion.button
            style={{ opacity: discardOpacity }}
            onClick={onDiscard}
            className="p-4 bg-red-100 rounded-full text-red-500 hover:bg-red-200 transition-colors"
          >
            <X className="w-8 h-8" />
          </motion.button>

          <motion.button
            style={{ opacity: keepOpacity }}
            onClick={onKeep}
            className="p-4 bg-green-100 rounded-full text-green-500 hover:bg-green-200 transition-colors"
          >
            <Check className="w-8 h-8" />
          </motion.button>
        </div>

        {/* Visual hint for drag */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center text-sm text-gray-400">
          Drag card or use buttons
        </div>
      </div>
    </motion.div>
  );
};
