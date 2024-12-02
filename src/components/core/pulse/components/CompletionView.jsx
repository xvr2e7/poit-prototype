import React from "react";
import { motion } from "framer-motion";

export const CompletionView = ({
  selectedCount,
  totalCount,
  onSave,
  saved,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-8 rounded-xl shadow-xl text-center"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">All done!</h2>
      <p className="text-gray-600 mb-6">
        You've selected {selectedCount} out of {totalCount} words
      </p>
      {!saved ? (
        <button
          onClick={onSave}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Save Selection
        </button>
      ) : (
        <p className="text-green-600 font-medium">✓ Selection saved</p>
      )}
    </motion.div>
  );
};
