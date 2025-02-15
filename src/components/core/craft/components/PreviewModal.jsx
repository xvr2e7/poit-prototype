import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, ArrowRightCircle, X } from "lucide-react";

const PreviewModal = ({
  isOpen,
  onClose,
  onDownload,
  onShare,
  onContinue,
  children,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-4xl bg-white dark:bg-gray-950 rounded-xl 
              border border-[#2C8C7C]/20 shadow-xl overflow-hidden"
          >
            {/* Header with close button */}
            <div className="absolute top-0 right-0 left-0 h-16 flex justify-end items-center px-6 z-10">
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#2C8C7C]/10 text-[#2C8C7C] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="p-8 pt-16">
              <div
                className="aspect-[1.4142] w-full bg-white dark:bg-gray-900 rounded-lg 
                border border-[#2C8C7C]/10 overflow-hidden"
              >
                <div className="w-full h-full flex items-center justify-center p-10 relative">
                  <div className="w-full h-full relative">{children}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-[#2C8C7C]/10 flex justify-between items-center">
              <div className="flex gap-3">
                <button
                  onClick={onDownload}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg
                    bg-[#2C8C7C]/10 hover:bg-[#2C8C7C]/20 
                    text-[#2C8C7C] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={onShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg
                    bg-[#2C8C7C]/10 hover:bg-[#2C8C7C]/20 
                    text-[#2C8C7C] transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>

              <button
                onClick={onContinue}
                className="flex items-center gap-2 px-6 py-2 rounded-lg
                  bg-[#2C8C7C] hover:bg-[#2C8C7C]/90 
                  text-white transition-colors"
              >
                <span>Continue to Echo</span>
                <ArrowRightCircle className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PreviewModal;
