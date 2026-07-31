import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "rgb(var(--cream-rgb) / <alpha-value>)",
          2: "rgb(var(--cream-2-rgb) / <alpha-value>)",
        },
        "avatar-plate": "rgb(var(--avatar-plate-rgb) / <alpha-value>)",
        paper: "rgb(var(--paper-rgb) / <alpha-value>)",
        sand: "rgb(var(--sand-rgb) / <alpha-value>)",
        ink: {
          DEFAULT: "rgb(var(--ink-rgb) / <alpha-value>)",
          soft: "rgb(var(--ink-soft-rgb) / <alpha-value>)",
        },
        orange: {
          DEFAULT: "#D5501F",
          dark: "#A83B14",
        },
        action: {
          DEFAULT: "var(--orange-action)",
          hover: "var(--orange-action-hover)",
        },
        gold: "#D9A441",
        olive: "#5F7A3D",
        teal: {
          DEFAULT: "#1B6560",
          deep: "#123F3C",
        },
        rust: "#B3341C",
        maroon: "#7A2E2E",
        line: "rgb(var(--line-rgb) / <alpha-value>)",
        bg: {
          DEFAULT: "rgb(var(--cream-rgb) / <alpha-value>)",
          alt: "rgb(var(--cream-2-rgb) / <alpha-value>)",
        },
        surface: "rgb(var(--paper-rgb) / <alpha-value>)",
        primary: {
          DEFAULT: "#D5501F",
          dark: "#A83B14",
          foreground: "#FBF3E1",
        },
        /* shadcn/calendar aliases → LIC tokens */
        background: "rgb(var(--paper-rgb) / <alpha-value>)",
        foreground: "rgb(var(--ink-rgb) / <alpha-value>)",
        muted: {
          DEFAULT: "rgb(var(--cream-2-rgb) / <alpha-value>)",
          foreground: "rgb(var(--ink-soft-rgb) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--cream-2-rgb) / <alpha-value>)",
          foreground: "rgb(var(--ink-rgb) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--cream-rgb) / <alpha-value>)",
          foreground: "rgb(var(--ink-rgb) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "#B3341C",
          foreground: "#FBF3E1",
        },
        border: "rgb(var(--ink-rgb) / 0.15)",
        input: "rgb(var(--ink-rgb) / 0.2)",
        ring: "#D9A441",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-figtree)", "sans-serif"],
        stamp: ["var(--font-figtree)", "sans-serif"],
      },
      borderRadius: {
        lg: "26px",
        md: "16px",
      },
      boxShadow: {
        sticker: "7px 7px 0 var(--shadow-ink)",
        stickerSm: "5px 5px 0 var(--shadow-ink)",
        stickerMd: "6px 6px 0 var(--shadow-ink)",
        stickerLg: "10px 12px 0 var(--shadow-ink)",
        stickerHover: "9px 9px 0 var(--shadow-ink)",
        toast:
          "0px 32px 64px -16px rgba(0,0,0,0.30), 0px 16px 32px -8px rgba(0,0,0,0.30), 0px 8px 16px -4px rgba(0,0,0,0.24), 0px 4px 8px -2px rgba(0,0,0,0.24), 0px -8px 16px -1px rgba(0,0,0,0.16), 0px 2px 4px -1px rgba(0,0,0,0.24), 0px 0px 0px 1px rgba(0,0,0,1.00), inset 0px 0px 0px 1px rgba(255,255,255,0.08), inset 0px 1px 0px 0px rgba(255,255,255,0.20)",
      },
      maxWidth: {
        wrap: "1180px",
      },
      backgroundImage: {
        "gradient-conic":
          "conic-gradient(var(--conic-position), var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
