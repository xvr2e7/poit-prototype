import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconClose } from "../../../shared/icons";

// Mineral pigment tones from the painter's tray: gamboge, azurite, violet
const POS_LABELS = {
  noun: { label: "Nouns", color: "text-[#8A6A1C] dark:text-[#D9B45B]", bg: "bg-[#C9962E]/10" },
  verb: { label: "Verbs", color: "text-[#3E617A] dark:text-[#8FB3CC]", bg: "bg-[#4A7A96]/10" },
  adj: { label: "Adjectives", color: "text-[#6B5488] dark:text-[#B3A0D1]", bg: "bg-[#8A6FA8]/10" },
  other: { label: "Other", color: "text-ink/50", bg: "bg-ink/5" },
};

const PoolWordsModal = ({ isOpen, onClose, poolWords = [], onWordSelect }) => {
  if (!isOpen) return null;

  const groupedWords = useMemo(() => {
    const groups = { noun: [], verb: [], adj: [], other: [] };
    for (const word of poolWords) {
      const key = groups[word.type] ? word.type : "other";
      groups[key].push(word);
    }
    // Only return non-empty groups
    return Object.entries(groups).filter(([, words]) => words.length > 0);
  }, [poolWords]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center
            bg-ink/25 backdrop-blur-sm p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-surface rounded-xl w-full max-w-4xl
              shadow-leaf dark:shadow-leaf-dark border border-ink/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="px-8 py-5 border-b border-seal/10
              flex items-center justify-between"
            >
              <div>
                <h3 className="font-serif text-xl font-medium text-ink">
                  The word pool
                </h3>
                <p className="font-mono text-xs text-ink/45 mt-1">
                  {poolWords.length} words waiting
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-seal/10
                  text-ink/40 hover:text-ink/70 transition-colors"
              >
                <IconClose size={20} />
              </button>
            </div>

            {/* Word Grid grouped by POS */}
            <div className="px-8 py-6 max-h-[60vh] overflow-y-auto space-y-6">
              {groupedWords.length > 0 ? (
                groupedWords.map(([posKey, words]) => {
                  const pos = POS_LABELS[posKey] || POS_LABELS.other;
                  return (
                    <div key={posKey}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`font-mono text-[11px] uppercase tracking-label ${pos.color}`}>
                          {pos.label}
                        </span>
                        <span className="font-mono text-xs text-ink/35">
                          ({words.length})
                        </span>
                        <div className="flex-1 h-px bg-ink/10" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {words.map((word, index) => (
                          <motion.div
                            key={word.id || `word-${posKey}-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className={`flex items-center justify-between p-3
                              ${pos.bg} rounded-lg group hover:bg-seal/10
                              transition-colors cursor-pointer`}
                            onClick={() => onWordSelect(word)}
                          >
                            <span className="font-serif text-lg text-ink/85">
                              {word.text}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 font-serif italic text-ink/40">
                  Every word is on the canvas
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="px-8 py-4 border-t border-seal/10
              bg-seal/5 flex justify-between items-center"
            >
              <p className="font-mono text-xs text-seal/80">
                Click a word to set it on the canvas
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PoolWordsModal;
