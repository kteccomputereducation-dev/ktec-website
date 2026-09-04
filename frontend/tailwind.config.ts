import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        ink: "#0B1E33",
        blueprint: {
          DEFAULT: "#1B3E6F",
          light: "#2A5590",
          dark: "#122A4D",
        },
        signal: {
          DEFAULT: "#0EA5B3",
          light: "#3FC2CE",
        },
        draft: {
          DEFAULT: "#E3A73E",
          dark: "#C68A24",
        },
        paper: "#F4F6F7",
        "paper-dim": "#EBEEF0",
        charcoal: "#1E2A38",
        slate: "#5B6B7A",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      backgroundImage: {
        blueprint:
          "linear-gradient(rgba(27,62,111,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(27,62,111,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "28px 28px",
      },
    },
  },
  plugins: [],
};
export default config;
