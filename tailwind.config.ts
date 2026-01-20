const { heroui } = require("@heroui/theme");
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        newIconScript: ["var(--font-new-icon-script)"],
        nourdLight: ["var(--font-nourd-light)"],
        nourdMedium: ["var(--font-nourd-medium)"],
        nourdBold: ["var(--font-nourd-bold)"],
      },
      colors: {
        primary: "#58624F",
        accent: "#f5efe6",
        "cool-gray": "#5D5D5D",
        "button-dark": "#e9e7db",
        "button-light": "#fff2e0",
        "border-button": "#D1D0C4",
        charcoal: {
          50: "#F5F5F4",
          100: "#E7E7E6",
          200: "#D1D1CF",
          300: "#B0B0AD",
          400: "#8F8F8B",
          500: "#6E6E69",
          600: "#52524E",
          700: "#3B3B38",
          800: "#2C2C29",
          900: "#1F1F1D",
          950: "#121210",
          DEFAULT: "#2C2C29",
        },
        gold: {
          50: "#F9F6EF",
          100: "#F2ECD8",
          200: "#E6DAAD",
          300: "#D9C882",
          400: "#CDB657",
          500: "#C5A669",
          600: "#B39358",
          700: "#8F7546",
          800: "#6B5835",
          900: "#473B23",
          950: "#241D12",
          DEFAULT: "#C5A669",
        },
        sand: {
          50: "#FBF9F6",
          100: "#F7F4EE",
          200: "#EBE5DA",
          300: "#DFD5C6",
          400: "#D3C5B2",
          500: "#C7B59E",
          600: "#BBA58A",
          700: "#AF9576",
          800: "#A38562",
          900: "#97754E",
          950: "#4D3B25",
          DEFAULT: "#EBE5DA",
        },
        status: {
          confirmed: "#22C55E",
          pending: "#EAB308",
          rejected: "#EF4444",
        },
        paper: "#F9F7F2",
      },
      backgroundImage: {
        main: 'url("/img/principal.jpg")',
        countdown: 'url("/img/countdown.webp")',
      },
    },
  },
  plugins: [heroui()],
};
export default config;
