import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, Book, ChevronDown, X, User, Lock } from "lucide-react";
import { useAuthForm } from "../../utils/hooks/useAuthForm";
import AuthModal from "./AuthModal";

const InitialView = ({
  onPlaygroundClick,
  onPoemletClick,
  onTestModeSelect,
}) => {
  const [showDevTools, setShowDevTools] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-12">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl font-light text-gray-900 dark:text-white">
            Welcome to POiT
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Where Words Connect Worlds
          </p>
        </motion.div>

        {/* Main Options */}
        <div className="grid gap-6">
          {/* Playground Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={onPlaygroundClick}
            className="group relative w-full h-36 rounded-2xl overflow-hidden transition-all duration-300
      bg-white/40 dark:bg-white/5
      hover:bg-white/50 dark:hover:bg-white/10"
          >
            <div className="relative h-full flex flex-col items-center justify-center p-6 space-y-3">
              <PlayCircle
                className="w-10 h-10 text-[#2C8C7C] group-hover:scale-110 
        transition-transform duration-300"
              />
              <span className="text-xl font-medium text-gray-900 dark:text-white tracking-wide">
                Enter Playground
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Explore and create without an account
              </span>
            </div>
          </motion.button>

          {/* Poemlet Button */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={onPoemletClick}
            className="group relative w-full h-36 rounded-2xl overflow-hidden transition-all duration-300
      bg-white/40 dark:bg-white/5
      hover:bg-white/50 dark:hover:bg-white/10"
          >
            <div className="relative h-full flex flex-col items-center justify-center p-6 space-y-3">
              <Book
                className="w-10 h-10 text-[#2C8C7C] group-hover:scale-110 
        transition-transform duration-300"
              />
              <span className="text-xl font-medium text-gray-900 dark:text-white tracking-wide">
                My Poemlet
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Your daily poetry journey
              </span>
            </div>
          </motion.button>
        </div>

        {/* Development Tools */}
        {process.env.NODE_ENV === "development" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <motion.button
              onClick={() => setShowDevTools(!showDevTools)}
              className="flex items-center justify-center gap-2 w-full py-2 text-sm
                text-gray-500 dark:text-gray-400 hover:text-gray-700 
                dark:hover:text-gray-200 transition-colors"
            >
              <span>Development Tools</span>
              <motion.div
                animate={{ rotate: showDevTools ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {showDevTools && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex justify-center gap-3 py-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onTestModeSelect("pulse")}
                      className="px-4 py-2 rounded-xl bg-[#2C8C7C]/10 
                        text-[#2C8C7C] dark:text-[#2C8C7C]/90 text-sm 
                        hover:bg-[#2C8C7C]/15 transition-colors duration-200"
                    >
                      Test Pulse
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onTestModeSelect("craft")}
                      className="px-4 py-2 rounded-xl bg-[#2C8C7C]/10 
                        text-[#2C8C7C] dark:text-[#2C8C7C]/90 text-sm 
                        hover:bg-[#2C8C7C]/15 transition-colors duration-200"
                    >
                      Test Craft
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onTestModeSelect("echo")}
                      className="px-4 py-2 rounded-xl bg-[#2C8C7C]/10 
                        text-[#2C8C7C] dark:text-[#2C8C7C]/90 text-sm 
                        hover:bg-[#2C8C7C]/15 transition-colors duration-200"
                    >
                      Test Echo
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={onPoemletClick}
      />
    </div>
  );
};

export { InitialView, AuthModal };
