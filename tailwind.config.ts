import { nextui } from "@nextui-org/theme";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/(checkbox|link|navbar).js",
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
        button: "#e9e7db",
        "border-button": "#D1D0C4",
      },
      backgroundImage: {
        main: 'url("/img/principal.jpg")',
        countdown: 'url("/img/conteo.jpg")',
      },
    },
  },
  plugins: [nextui()],
};
export default config;
