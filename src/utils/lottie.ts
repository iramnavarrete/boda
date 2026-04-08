/**
 * Convierte un código de color HEX (ej. "#C5A669") a la estructura de array
 * normalizado que utiliza Lottie internamente: [r, g, b, a] (de 0 a 1).
 */
export const hexToLottieColorString = (hex: string): string => {
  // Quitamos el '#' si lo incluye
  hex = hex.replace(/^#/, "");

  // Si es un hex corto (ej. #FFF), lo expandimos a 6 caracteres
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Convertimos a RGB normalizado (0 a 1) y forzamos un máximo de 3 decimales
  const r = Number((parseInt(hex.slice(0, 2), 16) / 255).toFixed(3));
  const g = Number((parseInt(hex.slice(2, 4), 16) / 255).toFixed(3));
  const b = Number((parseInt(hex.slice(4, 6), 16) / 255).toFixed(3));

  // Retornamos exactamente la estructura de string que usa el JSON de Lottie
  return `[${r},${g},${b},1]`;
};

/**
 * ==========================================
 * CONFIGURACIÓN DE ANIMACIONES LOTTIE
 * ==========================================
 * Agrupa los colores originales por tipo de animación.
 * TypeScript leerá este objeto para saber exactamente qué colores pedirte.
 */
export const LOTTIE_CONFIG = {
  heart: {
    main: "[0.345,0.384,0.31,1]",
    secondary: "[0.4,0.43,0.35,1]",
    tertiary: "[0.46,0.49,0.4,1]",
    quarterly: "[0.52,0.54,0.45,1]",
    fiftriary: "[0.58,0.6,0.5,1]",
    sixtriary: "[0.2829,0.2529,0.1771,1]",
  },
  jn_logo: {
    main: "[0.35,0.38,0.31,1]",
    secondary: "[0.345,0.384,0.31]",
  },
} as const;

// --- TIPOS AVANZADOS ---
// Extrae automáticamente los nombres de las animaciones ('heart' | 'jn_logo')
export type LottieAnimationType = keyof typeof LOTTIE_CONFIG;

// Crea una regla estricta: Si eliges 'jn_logo', TE OBLIGA a pasar { main: string, secondary: string }
export type LottieReplacementColors<T extends LottieAnimationType> = Record<
  keyof (typeof LOTTIE_CONFIG)[T],
  string
>;

/**
 * Aplica colores dinámicos a un JSON de Lottie basándose en su tipo.
 * Gracias a los genéricos de TypeScript, el IDE te autocompletará y exigirá
 * exactamente los colores necesarios para la animación que elijas.
 * * @param lottieJson El objeto JSON original importado
 * @param type El tipo de animación (ej. 'jn_logo')
 * @param newColors Objeto con los nuevos colores HEX
 */
export const colorizeLottie = <
  TJson = unknown,
  TType extends LottieAnimationType = LottieAnimationType,
>(
  lottieJson: TJson,
  type: TType,
  newColors: LottieReplacementColors<TType>,
): TJson => {
  if (!lottieJson) return lottieJson;

  let lottieString = JSON.stringify(lottieJson);
  const originalColorsMap = LOTTIE_CONFIG[type];

  // Iteramos sobre las llaves de color que requiere esta animación específica
  const keys = Object.keys(originalColorsMap) as Array<
    keyof typeof originalColorsMap
  >;

  console.log({ newColors });

  keys.forEach((key) => {
    // Solución del error TypeScript: casteamos explícitamente a string
    const originalColorArray = originalColorsMap[key] as string;
    // Extraemos el color de forma segura con los tipos genéricos
    const newColorHex = newColors[
      key as keyof LottieReplacementColors<TType>
    ] as string;

    if (newColorHex) {
      const newLottieColorStr = hexToLottieColorString(newColorHex);
      lottieString = lottieString.replaceAll(
        originalColorArray,
        newLottieColorStr,
      );
    }
  });

  // Retornamos el objeto parseado manteniendo el tipado original (TJson)
  return JSON.parse(lottieString) as TJson;
};
