import React from "react";
import { motion } from "framer-motion";
import { LogIn, UserPlus, PlayCircle, Zap, PenLine, Radio } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { useAuthForm } from "../../utils/hooks/useAuthForm";

function Login({ onLogin, enterPlayground, onTestModeSelect }) {
  const {
    isRegistering,
    formData,
    handleInputChange,
    handleSubmit,
    toggleMode,
  } = useAuthForm(onLogin);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <img src="/poit-logo.svg" alt="POiT" className="w-24 h-24" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {isRegistering ? "Create Account" : "Welcome Back"}
          </h2>

          <LoginForm
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />

          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-2 mt-6"
          >
            {isRegistering ? (
              <>
                <UserPlus size={20} />
                Register
              </>
            ) : (
              <>
                <LogIn size={20} />
                Login
              </>
            )}
          </button>

          <button
            onClick={toggleMode}
            className="w-full mt-4 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            {isRegistering
              ? "Already have an account? Login"
              : "Need an account? Register"}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Quick Access</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onTestModeSelect("pulse")}
              className="w-full py-2 px-4 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Zap size={20} />
              Test Pulse Mode
            </button>

            <button
              onClick={() => onTestModeSelect("craft")}
              className="w-full py-2 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <PenLine size={20} />
              Test Craft Mode
            </button>

            <button
              onClick={() => onTestModeSelect("echo")}
              className="w-full py-2 px-4 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Radio size={20} />
              Test Echo Mode
            </button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <button
              onClick={enterPlayground}
              className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <PlayCircle size={20} />
              Try Playground Mode
            </button>
          </div>
        </motion.div>

        <p className="text-center mt-8 text-sm text-gray-600">
          &copy; 2024 POiT.
        </p>
      </div>
    </div>
  );
}

export default Login;
