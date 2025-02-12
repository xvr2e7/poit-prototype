import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export const CompletionView = ({ onSave, saved, selectedWords = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex items-center justify-center backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative max-w-lg w-full mx-4"
      >
        {/* Ambient particle effects */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[#2C8C7C]/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                repeatType: "reverse",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl p-8 border border-[#2C8C7C]/20">
          <motion.div
            className="flex items-center justify-center mb-6"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-8 h-8 text-[#2C8C7C]" />
          </motion.div>

          <h2 className="text-2xl font-bold text-[#2C8C7C] text-center mb-4">
            Words Gathered
          </h2>

          {/* Selected words display */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {selectedWords.map((word, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#2C8C7C]/10 rounded-lg p-2 text-center"
              >
                <span className="text-[#2C8C7C] text-sm">{word}</span>
              </motion.div>
            ))}
          </div>

          {!saved ? (
            <motion.button
              onClick={onSave}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 
                bg-[#2C8C7C] hover:bg-[#2C8C7C]/90 text-white rounded-lg 
                transition-colors group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Continue to Craft Mode</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#2C8C7C] font-medium text-center"
            >
              <p>✨ Transitioning to Craft Mode ✨</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
