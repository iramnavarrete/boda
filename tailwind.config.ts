import { nextui } from "@nextui-org/theme";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/(checkbox|link|navbar).js"
  ],
  theme: {
    extend: {
      fontFamily: {
        handlee: ["var(--font-handlee)"],
        outfit: ["var(--font-outfit)"],
        sacramento: ["var(--font-sacramento)"],
      },
      colors: {
        primary: "#956E0D",
        accent: "#FCCB7E",
        "cool-gray": "#5D5D5D",
      },
      backgroundImage: {
        main: 'url("/img/bg-1.webp")',
        countdown: 'url("/img/bg-2.webp")',
      },
    },
  },
  plugins: [nextui()],
};
export default config;
