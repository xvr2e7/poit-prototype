import React from "react";
import { User, Lock } from "lucide-react";

export const LoginForm = ({ formData, onInputChange, onSubmit }) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 block">
        Username
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <User size={20} />
        </div>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={onInputChange}
          className="w-full px-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          placeholder="Enter your username"
          required
        />
      </div>
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 block">
        Password
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Lock size={20} />
        </div>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={onInputChange}
          className="w-full px-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          placeholder="Enter your password"
          required
        />
      </div>
    </div>
  </form>
);
