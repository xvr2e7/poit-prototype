import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const PoolWordsModal = ({ isOpen, onClose, poolWords = [], onWordSelect }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center 
            bg-black/20 backdrop-blur-sm p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-4xl 
              shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="px-8 py-5 border-b border-[#2C8C7C]/10 
              flex items-center justify-between"
            >
              <div>
                <h3 className="text-xl font-medium text-[#2C8C7C]">
                  Available Words
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {poolWords.length} words in pool
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#2C8C7C]/10 
                  text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Word Grid */}
            <div className="px-8 py-6 max-h-[60vh] overflow-y-auto">
              {poolWords.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {poolWords.map((word, index) => (
                    <motion.div
                      key={word.id || `word-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="flex items-center justify-between p-3 
                        bg-[#2C8C7C]/5 rounded-lg group hover:bg-[#2C8C7C]/10
                        transition-colors cursor-pointer"
                      onClick={() => onWordSelect(word)}
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {word.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No words available in pool
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="px-8 py-4 border-t border-[#2C8C7C]/10 
              bg-[#2C8C7C]/5 flex justify-between items-center"
            >
              <p className="text-sm text-[#2C8C7C]">
                Click on a word to add it to your canvas
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PoolWordsModal;
