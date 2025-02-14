import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export const ToolButton = ({ icon: Icon, label, onClick, isActive }) => {
  const baseClasses =
    "group relative p-3 rounded-xl backdrop-blur-sm transition-all duration-300";

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${baseClasses} bg-white/5 hover:bg-[#2C8C7C]/10 
        border border-[#2C8C7C]/30 ${isActive ? "bg-[#2C8C7C]/10" : ""}`}
    >
      <Icon
        className={`relative z-10 w-5 h-5 transition-colors duration-300
          text-[#2C8C7C]/70 group-hover:text-[#2C8C7C]
          ${isActive ? "text-[#2C8C7C]" : ""}`}
      />

      {/* Tooltip */}
      <div
        className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
        bg-white dark:bg-gray-950 border border-[#2C8C7C]/20 rounded-lg
        opacity-0 group-hover:opacity-100 transition-opacity duration-300 
        pointer-events-none px-3 py-2 shadow-lg"
      >
        <span className="text-sm text-[#2C8C7C] whitespace-nowrap font-medium">
          {label}
        </span>
      </div>
    </motion.button>
  );
};

export const ToolSeparator = () => (
  <div className="w-full h-px bg-[#2C8C7C]/10 my-3" />
);

export const ToolGroup = ({ children, className = "" }) => (
  <div className={`flex flex-col gap-3 ${className}`}>{children}</div>
);

export const Panel = ({ isOpen, onClose, title, children }) => {
  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{
        x: isOpen ? 0 : -100,
        opacity: isOpen ? 1 : 0,
      }}
      className="fixed right-28 top-8 bg-white dark:bg-gray-950 
        rounded-lg border border-[#2C8C7C]/20 shadow-lg"
    >
      <div className="flex items-center justify-between p-3 border-b border-[#2C8C7C]/10">
        <h3 className="text-[#2C8C7C] font-medium">{title}</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-[#2C8C7C]/10 text-[#2C8C7C]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-3">{children}</div>
    </motion.div>
  );
};

export const ConfirmDialog = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="absolute inset-0 right-20 flex items-center justify-center">
        <div
          className="bg-white dark:bg-gray-950 rounded-xl 
          border border-[#2C8C7C]/20 p-6 w-80 shadow-xl"
        >
          <h3 className="text-lg font-medium text-[#2C8C7C] mb-3">
            Reset Canvas?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            This will return all words to the word pool. This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg hover:bg-[#2C8C7C]/5
                text-[#2C8C7C] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-[#2C8C7C]/10 
                hover:bg-[#2C8C7C]/20 text-[#2C8C7C]
                transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
