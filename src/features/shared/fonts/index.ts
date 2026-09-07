// Extraemos las fuentes a su propio archivo para que Next.js las optimice
// globalmente y no se re-instancien en cada render.
import localFont from "next/font/local";

// ─── Tipos ──────────────────────────────────────────────────────────────────

/** Forma mínima de un resultado de `localFont()` que necesitamos. */
export type FontInstance = { variable: string };

/** Identificadores de las fuentes disponibles en este proyecto. */
export type FontKey =
  | "newIconScript"
  | "nourdLight"
  | "nourdMedium"
  | "nourdBold"
  | "rhymeFormal"
  | "greatVibes"
  | "edwardianScriptItc"
  | "ebGaramondItalic"
  | "alexBrush"
  | "tangerine"
  | "tangerineBold"
  | "gistesy"
  | "pinyonScript"
  | "autography"
  | "comprehensionDark"
  | "comprehensionSemiBold"
  | "aboveBeyondScript";

// ─── Fuentes (declaraciones, sin cambios) ───────────────────────────────────

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

// ─── Tangerine (Peter Wiegel, OFL) ──────────────────────────────────────────

export const tangerine = localFont({
  src: "../../../../src/fonts/Tangerine-Regular.woff2",
  variable: "--font-tangerine",
  display: "swap",
});

export const tangerineBold = localFont({
  src: "../../../../src/fonts/Tangerine-Bold.woff2",
  variable: "--font-tangerine-bold",
  display: "swap",
});

// ─── Mapa nombre → instancia + helpers ──────────────────────────────────────

/**
 * Mapa de cada `FontKey` a su instancia de `localFont`.
 *
 * Usar `satisfies` (en vez de `: Record<FontKey, FontInstance>`) preserva
 * los tipos literales de cada `localFont()` para que las CSS variables se
 * sigan deduciendo correctamente en cada call site.
 */
const FONT_MAP = {
  newIconScript,
  nourdLight,
  nourdMedium,
  nourdBold,
  rhymeFormal,
  greatVibes,
  edwardianScriptItc,
  ebGaramondItalic,
  alexBrush,
  tangerine,
  tangerineBold,
  gistesy,
  pinyonScript,
  autography,
  comprehensionDark,
  comprehensionSemiBold,
  aboveBeyondScript,
} satisfies Record<FontKey, FontInstance>;

/**
 * Devuelve las instancias de `localFont` para los `FontKey` dados.
 * Útil para que las configs declaren subsets por nombre sin importar
 * las fuentes directamente.
 */
export function getFontsByKey(keys: FontKey[]): FontInstance[] {
  return keys.map((k) => FONT_MAP[k]);
}

/**
 * Fuentes que SIEMPRE se cargan en cualquier invitación que use
 * `FrontLayout` (con o sin `additionalFonts`):
 *  - `newIconScript`, `nourdLight`, `nourdMedium`, `nourdBold`:
 *    las usan los componentes default (parents, quote, cover, etc.).
 *  - `rhymeFormal`: la usa `WaxSeal` (el sobre de apertura), presente
 *    en todas las invitaciones.
 */
export const CORE_FONT_KEYS: readonly FontKey[] = [
  "newIconScript",
  "nourdLight",
  "nourdMedium",
  "nourdBold",
  "rhymeFormal",
] as const;

export function getCoreFonts(): FontInstance[] {
  return getFontsByKey([...CORE_FONT_KEYS]);
}
