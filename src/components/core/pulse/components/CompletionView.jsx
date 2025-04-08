import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import SelectedWordsModal from "./SelectedWordsModal";

export const CompletionView = ({ onSave, saved, selectedWords = [] }) => {
  // Disable word selection when completion view is active
  useEffect(() => {
    // Store the original cursor style
    const originalStyle = window.getComputedStyle(document.body).cursor;
    // Prevent interactions with words underneath
    document.body.style.cursor = "default";

    return () => {
      document.body.style.cursor = originalStyle;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Re-use the SelectedWordsModal component with continue button */}
      <SelectedWordsModal
        isOpen={true}
        onClose={() => {}} // No close action in completion view
        selectedWords={selectedWords}
        onRemoveWord={() => {}} // No word removal in completion view
        minWords={5}
        maxWords={10}
        showContinueButton={!saved}
        onContinue={onSave}
      />

      {/* Ambient background effect */}
      <motion.div
        className="fixed inset-0 -z-10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
      >
        {/* Animated particles */}
        {!saved &&
          [...Array(20)].map((_, i) => (
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
      </motion.div>

      {/* Success state message */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none"
        >
          <motion.div
            className="flex flex-col items-center"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <Sparkles className="w-12 h-12 text-[#2C8C7C]" />
            <motion.p
              className="text-xl text-[#2C8C7C] mt-4 font-light"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              Moving to Craft Mode...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
