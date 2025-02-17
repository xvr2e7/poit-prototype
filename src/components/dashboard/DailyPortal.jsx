import React from "react";
import { motion } from "framer-motion";

const DailyPortal = ({ onEnter }) => {
  return (
    <motion.button
      className="w-full aspect-square relative group"
      onClick={onEnter}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Portal circle */}
      <div className="absolute inset-0">
        {/* Animated rings */}
        <motion.div
          className="absolute inset-4 rounded-full border border-[#2C8C7C]/30"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border border-[#2C8C7C]/20"
          animate={{
            scale: [1.1, 1.2, 1.1],
            opacity: [0.2, 0.05, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />

        {/* Main portal */}
        <div
          className="absolute inset-4 rounded-full bg-gradient-to-br 
          from-white/10 to-transparent dark:from-white/5
          backdrop-blur-sm border border-[#2C8C7C]/30
          flex items-center justify-center"
        >
          <div className="text-center">
            <motion.img
              src="/favicon.svg"
              alt="POiT"
              className="w-16 h-16 mx-auto mb-4"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <span className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
              POiT!
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default DailyPortal;
