import React, { useState } from "react";
import { motion } from "framer-motion";
import { ThemeToggle } from "../shared/AdaptiveBackground";
import { InitialView, AuthModal } from "./InitialView";

function Login({ onLogin, enterPlayground, onTestModeSelect }) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handlePlaygroundClick = () => {
    enterPlayground();
  };

  const handlePoemletClick = () => {
    setShowAuthModal(true);
  };

  return (
    <div className="w-full min-h-screen flex">
      {/* Left Panel - Decorative Content */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-col w-1/2 dark:bg-gray-900/50 bg-white/50 
          backdrop-blur-sm border-r border-gray-200 dark:border-white/10"
      >
        {/* Logo Area */}
        <div className="p-12">
          <motion.img
            src="./favicon.svg"
            alt="POiT"
            className="h-16 w-auto"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Decorative Poetry */}
        <div className="flex-1 relative p-12">
          <div className="space-y-6">
            {[
              "Do not go gentle into that good night,",
              "Old age should burn and rave at close of day;",
              "Rage, rage against the dying of the light.",
              "Though wise men at their end know dark is right,",
              "Because their words had forked no lightning they",
              "Do not go gentle into that good night.",
            ].map((text, i) => (
              <motion.div
                key={text}
                className="relative"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              >
                <h2
                  className="text-xl font-light dark:text-white/40 text-gray-400/90"
                  style={{ fontFamily: "Space Mono, monospace" }}
                >
                  {text}
                </h2>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footnote */}
        <div className="text-xl font-light text-gray-600/90 dark:text-white/60 mb-6 ml-6">
          <span>POiT, 2025</span>
        </div>
      </motion.div>

      {/* Right Panel - Main Content */}
      <div className="flex-1 relative flex flex-col">
        <ThemeToggle />

        <InitialView
          onPlaygroundClick={handlePlaygroundClick}
          onPoemletClick={handlePoemletClick}
          onTestModeSelect={onTestModeSelect}
        />

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={onLogin}
        />
      </div>
    </div>
  );
}

export default Login;
