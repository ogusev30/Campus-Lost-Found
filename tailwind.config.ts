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
        paper: {
          DEFAULT: "#F0E4D0",
          dark: "#DCC6A5",
          darker: "#E6D3BB",
        },
        ink: {
          DEFAULT: "#1B2A4A",
          light: "#2E4269",
          faint: "#5A6B8C",
        },
        mustard: {
          DEFAULT: "#D8A322",
          dark: "#B4841A",
          light: "#F0C862",
        },
        brick: {
          DEFAULT: "#B3452C",
          dark: "#8F3521",
          light: "#D46B4C",
        },
        cork: {
          DEFAULT: "#8B6F47",
          dark: "#6B5535",
        },
      },
      fontFamily: {
        display: ["var(--font-bitter)", "Georgia", "serif"],
        body: ["var(--font-work-sans)", "Helvetica", "Arial", "sans-serif"],
        stamp: ["var(--font-permanent-marker)", "cursive"],
      },
      boxShadow: {
        flyer: "2px 4px 0 rgba(27,42,74,0.12), 0 8px 16px rgba(27,42,74,0.10)",
        "flyer-hover":
          "3px 6px 0 rgba(27,42,74,0.16), 0 12px 24px rgba(27,42,74,0.14)",
        pin: "0 2px 3px rgba(0,0,0,0.35)",
      },
      borderRadius: {
        flyer: "2px",
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(circle at 1px 1px, rgba(27,42,74,0.08) 1px, transparent 0)",
      },
      backgroundSize: {
        grain: "18px 18px",
      },
    },
  },
  plugins: [],
};

export default config;
