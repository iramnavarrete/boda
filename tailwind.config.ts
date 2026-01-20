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
        gold: {
          DEFAULT: "#C5A669", // Uso: bg-gold, text-gold
          600: "#B39358", // Uso: bg-gold-600
        },
        status: {
          confirmed: "#22C55E", // Uso: bg-status-confirmed
          pending: "#EAB308",
          rejected: "#EF4444",
        },
        sand: {
          DEFAULT: "#EBE5DA",
          light: "#FDFBF7",
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
