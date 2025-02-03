import React from "react";
import { User, Lock } from "lucide-react";

export const LoginForm = ({ formData, onInputChange, onSubmit }) => (
  <form onSubmit={onSubmit} className="space-y-5">
    {/* Username field */}
    <div className="space-y-2">
      <div className="relative group">
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 
          group-focus-within:text-blue-500 transition-colors"
        >
          <User size={20} />
        </div>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={onInputChange}
          placeholder="Enter your username"
          className="w-full bg-white/50 dark:bg-white/5 backdrop-blur-sm border 
            border-gray-200 dark:border-white/10 rounded-xl px-11 py-3 outline-none
            text-gray-900 dark:text-white placeholder:text-gray-500 
            dark:placeholder:text-gray-400
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500
            transition-all duration-200"
          required
        />
        {/* Subtle glow effect on focus */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 
          group-focus-within:opacity-100 transition-opacity duration-300
          bg-blue-500/5 -z-10 blur-sm"
        />
      </div>
    </div>

    {/* Password field */}
    <div className="space-y-2">
      <div className="relative group">
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 
          group-focus-within:text-blue-500 transition-colors"
        >
          <Lock size={20} />
        </div>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={onInputChange}
          placeholder="Enter your password"
          className="w-full bg-white/50 dark:bg-white/5 backdrop-blur-sm border 
            border-gray-200 dark:border-white/10 rounded-xl px-11 py-3 outline-none
            text-gray-900 dark:text-white placeholder:text-gray-500 
            dark:placeholder:text-gray-400
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500
            transition-all duration-200"
          required
        />
        {/* Subtle glow effect on focus */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 
          group-focus-within:opacity-100 transition-opacity duration-300
          bg-blue-500/5 -z-10 blur-sm"
        />
      </div>
    </div>
  </form>
);
