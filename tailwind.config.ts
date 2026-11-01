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
        border: "var(--border)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          elevated: "var(--card-elevated)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          muted: "var(--accent-muted)",
          foreground: "var(--accent-foreground)",
        },
        brand: {
          50: "#fdf4f2",
          100: "#fce8e4",
          200: "#f9cfc6",
          300: "#f2a090",
          400: "#e07060",
          500: "#b83a28",
          600: "#b83a28",
          700: "#9a3022",
          800: "#8b2a18",
          900: "#6f2214",
          950: "#3d120a",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Source Sans 3", "Segoe UI", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Newsreader", "Georgia", "Times New Roman", "serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "ui-monospace", "monospace"],
        display: ["var(--font-serif)", "Newsreader", "Georgia", "serif"],
      },
      maxWidth: {
        content: "42rem",
        wide: "72rem",
      },
      transitionDuration: {
        fast: "150ms",
      },
    },
  },
  plugins: [],
};

export default config;
