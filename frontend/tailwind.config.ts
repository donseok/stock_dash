import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        up: "#ef4444",
        down: "#3b82f6",
        surface: {
          DEFAULT: "#ffffff",
          dark: "#1e293b",
        },
        card: {
          DEFAULT: "#f8fafc",
          dark: "#0f172a",
        },
        accent: {
          gold: "#f59e0b",
          silver: "#94a3b8",
          crypto: "#8b5cf6",
          forex: "#06b6d4",
          domestic: "#10b981",
          foreign: "#6366f1",
        },
      },
      animation: {
        "pulse-live": "pulse-live 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "pulse-live": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
