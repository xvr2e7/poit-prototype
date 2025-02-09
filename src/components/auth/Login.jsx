import React from "react";
import { LogIn, UserPlus, Zap, PenLine, Radio, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import { LoginForm } from "./LoginForm";
import { useAuthForm } from "../../utils/hooks/useAuthForm";
import { ThemeToggle } from "../shared/AdaptiveBackground";

function Login({ onLogin, enterPlayground, onTestModeSelect }) {
  const {
    isRegistering,
    formData,
    handleInputChange,
    handleSubmit,
    toggleMode, // Make sure this is used from useAuthForm
  } = useAuthForm(onLogin);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <ThemeToggle />

      {/* Logo */}
      <div className="fixed top-6 left-6">
        <img
          src="../../../public/favicon.svg"
          alt="POiT"
          className="h-14 w-auto"
        />
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Login Card */}
        <div
          className="bg-white/90 dark:bg-gray-900/50 backdrop-blur-md rounded-3xl 
          shadow-xl border border-white/20 p-8 space-y-6"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center">
            {isRegistering ? "Create Account" : "Welcome Back"}
          </h2>

          <LoginForm
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            isRegistering={isRegistering}
          />

          {/* Primary Action */}
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl 
              p-3 flex items-center justify-center gap-2 transition-colors"
          >
            {isRegistering ? (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Register</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </>
            )}
          </button>

          {/* Toggle Registration */}
          <button
            onClick={toggleMode}
            className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 
              dark:hover:text-gray-200 text-sm transition-colors"
          >
            {isRegistering
              ? "Already have an account? Login"
              : "Need an account? Register"}
          </button>

          {/* Quick Access Section */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span
                className="px-2 bg-white/90 dark:bg-gray-900/50 
                text-gray-500 dark:text-gray-400"
              >
                Quick Access
              </span>
            </div>
          </div>

          {/* Mode Testing Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => onTestModeSelect("pulse")}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl 
                p-3 flex items-center justify-center gap-2 transition-colors"
            >
              <Zap className="w-5 h-5" />
              Test Pulse Mode
            </button>

            <button
              onClick={() => onTestModeSelect("craft")}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl 
                p-3 flex items-center justify-center gap-2 transition-colors"
            >
              <PenLine className="w-5 h-5" />
              Test Craft Mode
            </button>

            <button
              onClick={() => onTestModeSelect("echo")}
              className="w-full bg-violet-500 hover:bg-violet-600 text-white rounded-xl 
                p-3 flex items-center justify-center gap-2 transition-colors"
            >
              <Radio className="w-5 h-5" />
              Test Echo Mode
            </button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span
                  className="px-2 bg-white/90 dark:bg-gray-900/50 
                  text-gray-500 dark:text-gray-400"
                >
                  Or
                </span>
              </div>
            </div>

            {/* Playground Button */}
            <button
              onClick={enterPlayground}
              className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl 
                p-3 flex items-center justify-center gap-2 transition-colors"
            >
              <PlayCircle className="w-5 h-5" />
              Try Playground Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
