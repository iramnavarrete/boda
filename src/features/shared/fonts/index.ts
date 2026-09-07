// Extraemos las fuentes a su propio archivo para que Next.js las optimice
// globalmente y no se re-instancien en cada render.
import localFont from "next/font/local";

export const newIconScript = localFont({
  src: "../../../../src/fonts/NewIconScript-Regular.woff2",
  variable: "--font-new-icon-script",
  display: "swap", // Mejora la carga dinámica (evita bloqueos de texto)
});

export const nourdLight = localFont({
  src: "../../../../src/fonts/Nourd-Light.woff2",
  variable: "--font-nourd-light",
  display: "swap",
});

export const nourdMedium = localFont({
  src: "../../../../src/fonts/Nourd-Medium.woff2",
  variable: "--font-nourd-medium",
  display: "swap",
});

export const nourdBold = localFont({
  src: "../../../../src/fonts/Nourd-Bold.woff2",
  variable: "--font-nourd-bold",
  display: "swap",
});

export const autography = localFont({
  src: "../../../../src/fonts/Autography.woff2",
  variable: "--font-autography",
  display: "swap",
});

export const comprehensionDark = localFont({
  src: "../../../../src/fonts/Comprehension-Dark.woff2",
  variable: "--font-comprehension-dark",
  display: "swap",
});

export const comprehensionSemiBold = localFont({
  src: "../../../../src/fonts/Comprehension-SemiBold.woff2",
  variable: "--font-comprehension-semi-bold",
  display: "swap",
});

export const aboveBeyondScript = localFont({
  src: "../../../../src/fonts/AbovetheBeyond-Script.woff2",
  variable: "--font-above-beyond-script",
  display: "swap",
});

export const rhymeFormal = localFont({
  src: "../../../../src/fonts/Rhyme-Formal.woff2",
  variable: "--font-rhyme-formal",
  display: "swap",
});

export const edwardianScriptItc = localFont({
  src: "../../../../src/fonts/EdwardianScriptITC.woff2",
  variable: "--font-edwardian-script-itc",
  display: "swap",
});

export const greatVibes = localFont({
  src: "../../../../src/fonts/GreatVibes-Regular.woff2",
  variable: "--font-great-vibes",
  display: "swap",
});

export const gistesy = localFont({
  src: "../../../../src/fonts/Gistesy.woff2",
  variable: "--font-gistesy",
  display: "swap",
});

export const alexBrush = localFont({
  src: "../../../../src/fonts/AlexBrush-Regular.woff2",
  variable: "--font-alex-brush",
  display: "swap",
});

export const ebGaramondItalic = localFont({
  src: "../../../../src/fonts/EBGaramond-Italic.woff2",
  variable: "--font-eb-garamond-italic",
  display: "swap",
});

export const pinyonScript = localFont({
  src: "../../../../src/fonts/PinyonScript-Regular.woff2",
  variable: "--font-pinyon-script",
  display: "swap",
});
