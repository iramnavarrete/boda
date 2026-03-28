// Extraemos las fuentes a su propio archivo para que Next.js las optimice
// globalmente y no se re-instancien en cada render.
import localFont from "next/font/local";

export const newIconScript = localFont({
  src: "../../../../src/fonts/New-Icon-Script.otf",
  variable: "--font-new-icon-script",
  display: "swap", // Mejora la carga dinámica (evita bloqueos de texto)
});

export const nourdLight = localFont({
  src: "../../../../src/fonts/nourd_light.ttf",
  variable: "--font-nourd-light",
  display: "swap",
});

export const nourdMedium = localFont({
  src: "../../../../src/fonts/nourd_medium.ttf",
  variable: "--font-nourd-medium",
  display: "swap",
});

export const nourdBold = localFont({
  src: "../../../../src/fonts/nourd_bold.ttf",
  variable: "--font-nourd-bold",
  display: "swap",
});
