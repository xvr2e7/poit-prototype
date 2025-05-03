import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const SelectedWordsModal = ({
  isOpen,
  onClose,
  selectedWords = [],
  onRemoveWord,
  minWords = 5,
  maxWords = 20,
  onContinue = null,
}) => {
  // Get the message based on word count
  const getMessage = () => {
    const count = selectedWords.length;

    if (count < minWords) {
      return `Select ${minWords - count} more word${
        minWords - count === 1 ? "" : "s"
      } to continue`;
    } else if (count < maxWords) {
      return (
        "Ready to continue, or select up to " + (maxWords - count) + " more"
      );
    } else {
      return "Maximum words selected";
    }
  };

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center 
            bg-black/30 backdrop-blur-sm p-6"
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
                  Selected Words
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedWords.length} of {maxWords} words selected
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

            {/* Word list */}
            <div className="px-8 py-6 max-h-[60vh] overflow-y-auto">
              {selectedWords.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {selectedWords.map((word, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center justify-between p-3 
                        bg-[#2C8C7C]/5 rounded-lg group hover:bg-[#2C8C7C]/10
                        transition-colors"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {word}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveWord(word);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full
                          hover:bg-[#2C8C7C]/20 text-gray-400 hover:text-gray-600
                          dark:text-gray-500 dark:hover:text-gray-300
                          transition-all"
                        aria-label={`Remove ${word}`}
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No words selected yet
                </div>
              )}
            </div>

            {/* Footer with status and actions */}
            <div
              className="px-8 py-4 border-t border-[#2C8C7C]/10 
              bg-[#2C8C7C]/5 flex items-center justify-between"
            >
              <p className="text-sm text-[#2C8C7C]">{getMessage()}</p>

              {/* Show continue button if enough words are selected and onContinue is provided */}
              {selectedWords.length >= minWords && onContinue && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onContinue();
                  }}
                  className="px-6 py-2 bg-[#2C8C7C] hover:bg-[#2C8C7C]/90 
                    text-white rounded-lg shadow-sm transition-colors"
                >
                  Continue to Craft
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SelectedWordsModal;
