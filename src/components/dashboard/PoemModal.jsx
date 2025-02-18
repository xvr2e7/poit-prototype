import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star } from "lucide-react";

const PoemModal = ({ poem, isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 
          flex items-center justify-center p-6"
        onClick={onClose}
      >
        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl 
            overflow-hidden shadow-xl relative"
        >
          {/* Header */}
          <div
            className="p-6 border-b border-gray-200 dark:border-gray-800
            flex items-start justify-between"
          >
            <div>
              <h2 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
                {poem.title}
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                by {poem.author}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSave(poem)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                  text-gray-600 dark:text-gray-400 transition-colors"
              >
                <Star className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                  text-gray-600 dark:text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Poem Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-6">
              {poem.lines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="text-lg text-gray-800 dark:text-gray-200 
                    font-light whitespace-pre-wrap"
                  style={{ fontFamily: "Space Mono, monospace" }}
                >
                  {line || "\u00A0"}{" "}
                  {/* Use non-breaking space for empty lines */}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PoemModal;
