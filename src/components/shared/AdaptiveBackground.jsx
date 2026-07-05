import React, { createContext, useContext, useEffect, useState } from "react";
import { IconMonitor, IconMoon, IconSun } from "./icons";

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
    { value: "light", icon: IconSun },
    { value: "system", icon: IconMonitor },
    { value: "dark", icon: IconMoon },
  ];

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-1 p-1 rounded-lg bg-surface/60 backdrop-blur-sm border border-ink/10">
      {options.map(({ value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`p-2 rounded-md transition-colors ${
            theme === value
              ? "bg-seal/10 text-seal"
              : "text-ink/40 hover:text-ink/70"
          }`}
        >
          <Icon size={20} />
        </button>
      ))}
    </div>
  );
};

// Background component — a sheet of laid paper by day, lampblack by night
export const AdaptiveBackground = () => (
  <div className="fixed inset-0 transition-colors duration-500 bg-paper bg-laid" />
);

export default AdaptiveBackground;
