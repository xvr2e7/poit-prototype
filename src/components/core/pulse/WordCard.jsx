import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export const WordCard = ({ word, onKeep, onDiscard }) => {
  return (
    <motion.div
      key={word}
      className="absolute w-full h-full"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      whileDrag={{ scale: 1.05 }}
    >
      <div className="w-full h-full bg-white rounded-xl shadow-xl p-8 flex flex-col items-center justify-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">{word}</h2>
        <div className="flex gap-8 mt-8">
          <button
            onClick={onDiscard}
            className="p-4 bg-red-100 rounded-full text-red-500 hover:bg-red-200 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <button
            onClick={onKeep}
            className="p-4 bg-green-100 rounded-full text-green-500 hover:bg-green-200 transition-colors"
          >
            <Check className="w-8 h-8" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
