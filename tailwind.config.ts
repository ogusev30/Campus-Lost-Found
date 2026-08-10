import type { Config } from "tailwindcss";

function withOpacity(variableName: string) {
  return ({ opacityValue }: { opacityValue?: string }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Tailwind's Config type doesn't model function-valued colors (needed
      // for the CSS-variable + opacity-modifier pattern), so cast to `any`.
      colors: {
        paper: {
          DEFAULT: withOpacity("--color-paper"),
          dark: withOpacity("--color-paper-dark"),
          darker: withOpacity("--color-paper-darker"),
        },
        ink: {
          DEFAULT: withOpacity("--color-ink"),
          light: withOpacity("--color-ink-light"),
          faint: withOpacity("--color-ink-faint"),
        },
        mustard: {
          DEFAULT: withOpacity("--color-mustard"),
          dark: withOpacity("--color-mustard-dark"),
          light: withOpacity("--color-mustard-light"),
        },
        brick: {
          DEFAULT: withOpacity("--color-brick"),
          dark: withOpacity("--color-brick-dark"),
          light: withOpacity("--color-brick-light"),
        },
        cork: {
          DEFAULT: withOpacity("--color-cork"),
          dark: withOpacity("--color-cork-dark"),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      fontFamily: {
        display: ["var(--font-bitter)", "Georgia", "serif"],
        body: ["var(--font-work-sans)", "Helvetica", "Arial", "sans-serif"],
        stamp: ["var(--font-permanent-marker)", "cursive"],
      },
      boxShadow: {
        flyer: "2px 4px 0 rgba(var(--color-ink), 0.12), 0 8px 16px rgba(var(--color-ink), 0.10)",
        "flyer-hover":
          "3px 6px 0 rgba(var(--color-ink), 0.16), 0 12px 24px rgba(var(--color-ink), 0.14)",
        pin: "0 2px 3px rgba(0,0,0,0.35)",
      },
      borderRadius: {
        flyer: "2px",
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(circle at 1px 1px, rgba(var(--color-ink), 0.08) 1px, transparent 0)",
      },
      backgroundSize: {
        grain: "18px 18px",
      },
    },
  },
  plugins: [],
};

export default config;
