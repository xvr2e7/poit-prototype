import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, Crown, X } from "lucide-react";
import { useAuthForm } from "../../utils/hooks/useAuthForm";

const AuthModal = ({ isOpen, onClose, onLogin, feature }) => {
  const [mode, setMode] = useState("login");
  const { formData, handleInputChange, handleSubmit } = useAuthForm(onLogin);

  // Get content based on feature type
  const getModalContent = () => {
    const content = {
      template: {
        title: "Templates",
        description: "Structure your poetry with classic forms",
      },
      signature: {
        title: "Signatures",
        description: "Add your unique mark to every poem",
      },
      download: {
        title: "Save Poems",
        description: "Download your creations",
      },
      share: {
        title: "Share",
        description: "Share your poems with others",
      },
      default: {
        title: mode === "login" ? "Welcome Back" : "Create Account",
        description: null,
      },
    };

    return content[feature] || content.default;
  };

  const { title, description } = getModalContent();

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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md bg-white dark:bg-gray-950 rounded-xl 
              border border-[#2C8C7C]/20 shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-[#2C8C7C]/10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {feature && <Crown className="w-5 h-5 text-[#2C8C7C]" />}
                  <h2 className="text-xl font-medium text-[#2C8C7C]">
                    {title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-[#2C8C7C] hover:text-[#2C8C7C]/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {description}
                </p>
              )}
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

export default AuthModal;
