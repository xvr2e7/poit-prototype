import React, { createContext, useContext, useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

// Create theme context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  // Calculate isDark based on theme and system preference
  const isDark =
    context.theme === "dark" ||
    (context.theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return { ...context, isDark };
};

// Theme Provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "system"
  );

  useEffect(() => {
    const updateTheme = () => {
      const isDark =
        theme === "dark" ||
        (theme === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      document.documentElement.classList.toggle("dark", isDark);
    };

    updateTheme();
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", updateTheme);

    return () => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", updateTheme);
    };
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleThemeChange }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme Toggle component
export const ThemeToggle = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  const options = [
    { value: "light", icon: Sun },
    { value: "system", icon: Monitor },
    { value: "dark", icon: Moon },
  ];

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-1 p-1 rounded-lg bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border border-white/20">
      {options.map(({ value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`p-2 rounded-md transition-colors ${
            theme === value
              ? "bg-white/20 text-black dark:text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
          }`}
        >
          <Icon size={20} />
        </button>
      ))}
    </div>
  );
};

// Background component
export const AdaptiveBackground = () => (
  <div
    className="fixed inset-0 transition-colors duration-500
    bg-gradient-to-b from-blue-50 to-blue-100 
    dark:from-gray-900 dark:to-blue-950"
  >
    <div
      className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.2),rgba(255,255,255,0))] 
      dark:bg-[radial-gradient(circle_at_50%_120%,rgba(36,0,70,0.4),rgba(0,0,0,0))]"
    />
  </div>
);

export default AdaptiveBackground;
