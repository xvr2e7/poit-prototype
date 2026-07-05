/** @type {import('tailwindcss').Config} */

/*
 * POiT design tokens — "Two Inks"
 *
 * Everything the poet makes is set in ink (Spectral serif).
 * Everything the tool says is jade — the collector's seal (Space Mono).
 * Surfaces are paper by day, lampblack by night.
 *
 * ink / seal / paper / surface are CSS variables (see styles/index.css)
 * so every opacity-modified utility adapts to dark mode automatically.
 */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    // Print-shop crispness: a tighter radius scale than Tailwind's default
    borderRadius: {
      none: "0",
      sm: "2px",
      DEFAULT: "3px",
      md: "4px",
      lg: "6px",
      xl: "8px",
      "2xl": "10px",
      "3xl": "14px",
      full: "9999px",
    },
    extend: {
      fontFamily: {
        serif: ['"Spectral"', "Georgia", "serif"],
        sans: ['"Spectral"', "Georgia", "serif"],
        mono: ['"Space Mono"', "ui-monospace", "monospace"],
        // The masthead voice: POiT itself, cut heavy and black
        display: ['"Fraunces"', '"Spectral"', "Georgia", "serif"],
      },
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        seal: "rgb(var(--seal) / <alpha-value>)",
        paper: "rgb(var(--paper) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        // Static aliases kept for `dark:` pairings (light value regardless of mode)
        parchment: {
          DEFAULT: "#F4EFE4",
          dark: "#181511",
        },
      },
      letterSpacing: {
        label: "0.14em",
      },
      boxShadow: {
        // Soft graphite lift for raised paper (panels, modals)
        leaf: "0 1px 2px rgb(28 22 12 / 0.06), 0 6px 24px -8px rgb(28 22 12 / 0.18)",
        "leaf-dark": "0 1px 2px rgb(0 0 0 / 0.4), 0 8px 28px -8px rgb(0 0 0 / 0.6)",
      },
    },
  },
  plugins: [],
};
