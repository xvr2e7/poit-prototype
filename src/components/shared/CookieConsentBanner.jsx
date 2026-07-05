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
            bg-surface/95 backdrop-blur-sm rounded-lg 
            border border-ink/10 shadow-leaf dark:shadow-leaf-dark flex items-center gap-4"
        >
          <div className="text-sm text-ink/70">
            POiT uses cookies to enhance your experience and save your progress.{" "}
            <button
              onClick={onViewPolicy}
              className="text-seal underline hover:text-seal/80 transition-colors"
            >
              Learn more
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAccept}
            className="px-4 py-1.5 rounded-lg bg-seal text-paper font-mono text-xs tracking-wide whitespace-nowrap"
          >
            Accept
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsentBanner;
