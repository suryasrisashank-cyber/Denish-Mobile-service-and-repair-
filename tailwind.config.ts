import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#101827",
          blue: "#1689E8",
          blueHover: "#1173C7",
          lightBg: "#F7F9FC",
          muted: "#64748B",
          darkBg: "#0B1120",
          darkCard: "#1E293B",
          darkMuted: "#94A3B8",
          darkBorder: "#334155",
          lightBorder: "#E2E8F0",
          // Luxury dark gold & cyan aesthetic
          dark: "#080a0f",
          surface: "#0f131a",
          card: "#141824",
          border: "#242b3d",
          gold: "#f5c344",
          goldLight: "#ffe58f",
          goldDark: "#b88716",
          cyan: "#00e5ff",
        },
      },
      fontFamily: {
        sans: [
          "Outfit",
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: ["Syne", "sans-serif"],
        script: ["Playball", "cursive"],
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        elevated: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
        "gold-glow": "0 0 25px rgba(245, 195, 68, 0.35)",
        "cyan-glow": "0 0 25px rgba(0, 229, 255, 0.35)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
