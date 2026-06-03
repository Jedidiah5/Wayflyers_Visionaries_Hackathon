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
        background: "#0a0a0a",
        surface: "#111111",
        "surface-elevated": "#1a1a1a",
        border: "#2a2a2a",
        accent: "#ffffff",
        acid: "#c8ff00",
        critical: "#ff3b3b",
        warning: "#ffaa00",
        "text-primary": "#e2e2e2",
        "text-muted": "#8a8a8a",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "Anton", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        badge: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
