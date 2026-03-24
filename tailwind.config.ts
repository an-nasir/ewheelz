import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // No dark mode — pure light JetBrains-style interface
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Semantic page / surface backgrounds ─────────────────────────────
        cyber: {
          950: "#F6F8FF",  // page bg — soft indigo-white
          900: "#FFFFFF",  // card surface
          800: "#EEF2FF",  // soft section bg
          700: "#E6E9F2",  // border / divider
          600: "#E6E9F2",  // compat alias
          500: "#E6E9F2",  // compat alias
        },

        // ── Brand primary: Indigo / Purple ───────────────────────────────────
        brand: {
          DEFAULT: "#6366F1",
          50:  "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },

        // ── Violet / AI accent ────────────────────────────────────────────
        violet: {
          DEFAULT: "#8B5CF6",
          50:  "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },

        // ── EV Energy Green ──────────────────────────────────────────────────
        "ev-green": {
          DEFAULT: "#22C55E",
          50:  "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
        },

        // ── Emerald (second green) ───────────────────────────────────────────
        "ev-emerald": {
          DEFAULT: "#10B981",
          500: "#10B981",
          600: "#059669",
        },

        // ── Neon aliases (kept for backward compat with existing pages) ──────
        neon: {
          green:  "#22C55E",
          cyan:   "#6366F1",   // remapped from blue to brand indigo
          blue:   "#3B82F6",
          purple: "#8B5CF6",
        },

        // ── Tech Blue — data / analytics ─────────────────────────────────────
        tech: {
          DEFAULT: "#3B82F6",
          soft:    "#DBEAFE",
          dark:    "#1D4ED8",
          light:   "#93C5FD",
        },

        // ── Spark / Pink highlight ────────────────────────────────────────────
        spark: {
          DEFAULT: "#8B5CF6",
          soft:    "#EDE9FE",
          dark:    "#6D28D9",
          light:   "#C4B5FD",
          pink:    "#EC4899",
        },

        // ── Semantic content text ─────────────────────────────────────────────
        content: {
          primary:   "#0F172A",
          secondary: "#475569",
          muted:     "#94A3B8",
          invert:    "#FFFFFF",
        },

        // ── Border ────────────────────────────────────────────────────────────
        border: {
          DEFAULT: "#E6E9F2",
          strong:  "#D1D9F0",
        },
      },

      // ── Background image helpers ─────────────────────────────────────────
      backgroundImage: {
        "gradient-primary":   "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
        "gradient-secondary": "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)",
        "gradient-energy":    "linear-gradient(135deg, #22C55E 0%, #10B981 100%)",
        "gradient-highlight": "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
        "gradient-warm":      "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
        "gradient-ocean":     "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
        "gradient-sunset":    "linear-gradient(135deg, #EC4899 0%, #F59E0B 100%)",
      },

      // ── Shadows ───────────────────────────────────────────────────────────
      boxShadow: {
        card:    "0 2px 8px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)",
        panel:   "0 4px 24px rgba(15,23,42,0.09), 0 1px 6px rgba(15,23,42,0.05)",
        glow:    "0 8px 32px rgba(99,102,241,0.25)",
        "glow-green": "0 8px 32px rgba(34,197,94,0.25)",
        "glow-blue":  "0 8px 32px rgba(59,130,246,0.25)",
        lg:      "0 8px 32px rgba(99,102,241,0.14), 0 4px 12px rgba(15,23,42,0.06)",
        brand:   "0 4px 16px rgba(99,102,241,0.30), 0 2px 6px rgba(99,102,241,0.15)",
      },

      // ── Font ──────────────────────────────────────────────────────────────
      fontFamily: {
        sans: ["Inter", "Space Grotesk", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },

      // ── Border radius ─────────────────────────────────────────────────────
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },

      // ── Animations ────────────────────────────────────────────────────────
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%":      { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition:  "200% center" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%":   { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":      { backgroundPosition: "100% 50%" },
        },
        "blob-float": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "33%":      { transform: "translateY(-20px) scale(1.04)" },
          "66%":      { transform: "translateY(10px) scale(0.97)" },
        },
      },
      animation: {
        "glow-pulse":      "glow-pulse 3s ease-in-out infinite",
        float:             "float 5s ease-in-out infinite",
        shimmer:           "shimmer 2s ease-in-out infinite",
        "fade-up":         "fade-up 0.5s cubic-bezier(.2,.8,.2,1) forwards",
        "slide-down":      "slide-down 0.22s cubic-bezier(.2,.8,.2,1) forwards",
        "gradient-shift":  "gradient-shift 6s ease-in-out infinite",
        "blob-float":      "blob-float 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
