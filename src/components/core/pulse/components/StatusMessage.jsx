import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const StatusMessage = ({ isActive, selectedWords, minWords, maxWords }) => {
  const getMessage = () => {
    if (!isActive) return "Begin";
    if (selectedWords.length < minWords) {
      return `${selectedWords.length}/${minWords}`;
    }
    if (selectedWords.length < maxWords) {
      return "Ready";
    }
    return "Complete";
  };

  const getDetail = () => {
    if (!isActive) return "Click anywhere to start";
    if (selectedWords.length < minWords) {
      return "Collect more words";
    }
    if (selectedWords.length < maxWords) {
      return "Double-click to finish";
    }
    return "Maximum words reached";
  };

  const getProgress = () => {
    if (!isActive) return 0;
    return Math.min(selectedWords.length / minWords, 1);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Main container */}
        <div
          className="px-6 py-3 rounded-xl bg-white/5 backdrop-blur-sm 
          border border-[#2C8C7C]/20 flex items-center gap-3"
        >
          {/* Progress pill */}
          <div
            className="h-7 rounded-full bg-[#2C8C7C]/10 flex items-center
            min-w-[3rem] relative overflow-hidden"
          >
            <motion.div
              className="absolute left-0 top-0 bottom-0 bg-[#2C8C7C]/20"
              initial={{ width: 0 }}
              animate={{ width: `${getProgress() * 100}%` }}
              transition={{ duration: 0.5 }}
            />
            <span
              className="relative w-full text-center text-sm font-medium 
              text-[#2C8C7C]"
            >
              {getMessage()}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-[#2C8C7C]/20" />

          {/* Detail text */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-[#2C8C7C]/70"
          >
            {getDetail()}
          </motion.span>
        </div>

        {/* Background glow */}
        <div className="absolute inset-0 -z-10 bg-[#2C8C7C]/5 blur-xl rounded-full" />
      </motion.div>
    </div>
  );
};

export default StatusMessage;
