import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, Book, ChevronDown, X, User, Lock } from "lucide-react";
import { useAuthForm } from "../../utils/hooks/useAuthForm";

const InitialView = ({
  onPlaygroundClick,
  onPoemletClick,
  onTestModeSelect,
}) => {
  const [showDevTools, setShowDevTools] = useState(false);

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
    </div>
  );
};

const AuthModal = ({ isOpen, onClose, onLogin }) => {
  const [mode, setMode] = useState("login");
  const { formData, handleInputChange, handleSubmit } = useAuthForm(onLogin);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl
              border border-gray-200 dark:border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-200 dark:border-white/10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {mode === "login" ? "Welcome Back" : "Create Account"}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400
                    dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800
                      border border-gray-200 dark:border-gray-700 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-violet-500
                      text-gray-900 dark:text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800
                      border border-gray-200 dark:border-gray-700 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-violet-500
                      text-gray-900 dark:text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Sign In Button */}
              <button
                onClick={handleSubmit}
                className="w-full py-2 px-4 bg-violet-500 hover:bg-violet-600
                  text-white rounded-xl transition-colors duration-200"
              >
                {mode === "login" ? "Sign In" : "Create Account"}
              </button>

              {/* Social Login */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    className="flex items-center justify-center gap-2 px-4 py-2
                    border border-gray-200 dark:border-gray-700 rounded-xl
                    hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200
                    text-gray-700 dark:text-gray-200"
                  >
                    {/* Apple SVG */}
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M14.94,5.19A4.38,4.38,0,0,0,16,2,4.44,4.44,0,0,0,13,3.52,4.17,4.17,0,0,0,12,6.61,3.69,3.69,0,0,0,14.94,5.19Zm2.52,7.44a4.51,4.51,0,0,1,2.16-3.81,4.66,4.66,0,0,0-3.66-2c-1.56-.16-3,.91-3.83.91s-2-.89-3.3-.87A4.92,4.92,0,0,0,4.69,9.39C2.93,12.45,4.24,17,6,19.47,6.8,20.68,7.8,22.05,9.12,22s1.75-.82,3.28-.82,2,.82,3.3.79,2.22-1.24,3.06-2.45a11,11,0,0,0,1.38-2.85A4.41,4.41,0,0,1,17.46,12.63Z" />
                    </svg>
                    Apple
                  </button>
                  <button
                    className="flex items-center justify-center gap-2 px-4 py-2
                    border border-gray-200 dark:border-gray-700 rounded-xl
                    hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200
                    text-gray-700 dark:text-gray-200"
                  >
                    {/* Google SVG */}
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>
                </div>
              </div>

              {/* Toggle Mode */}
              <div className="text-center">
                <button
                  onClick={() =>
                    setMode(mode === "login" ? "register" : "login")
                  }
                  className="text-sm text-violet-500 hover:text-violet-600
                    dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
                >
                  {mode === "login"
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { InitialView, AuthModal };
