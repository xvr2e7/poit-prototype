import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CookieConsentBanner = ({ onViewPolicy }) => {
  const [showBanner, setShowBanner] = useState(false);

  // Check if the user has already consented
  useEffect(() => {
    const hasConsented = localStorage.getItem("poit_cookie_consent");
    if (!hasConsented) {
      // Wait a moment before showing the banner for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("poit_cookie_consent", "true");
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-0 right-0 mx-auto w-max max-w-lg z-50 px-6 py-4 
            bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg 
            border border-[#2C8C7C]/20 shadow-lg flex items-center gap-4"
        >
          <div className="text-sm text-gray-700 dark:text-gray-300">
            POiT uses cookies to enhance your experience and save your progress.{" "}
            <button
              onClick={onViewPolicy}
              className="text-[#2C8C7C] underline hover:text-[#2C8C7C]/80 transition-colors"
            >
              Learn more
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAccept}
            className="px-4 py-1.5 rounded-lg bg-[#2C8C7C] text-white text-sm whitespace-nowrap"
          >
            Accept
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsentBanner;
