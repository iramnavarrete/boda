/**
 * Umbrales de altura (px) para elegir el botánico decorativo en la card.
 *
 *  - height <  SHORT_MAX    → Botanic4 (compacto, top-right)
 *  - height <= MEDIUM_MAX   → Botanic1 (medio, bottom-right)
 *  - height >  MEDIUM_MAX   → Botanic3 (elaborado, bottom-left)
 */
export const SHORT_MAX = 220;
export const MEDIUM_MAX = 340;

export type BotanicLevel = "short" | "medium" | "tall";

/** Mapea una altura en px al nivel de botánico correspondiente. */
export function botanicLevelFromHeight(height: number): BotanicLevel {
  if (height < SHORT_MAX) return "short";
  if (height <= MEDIUM_MAX) return "medium";
  return "tall";
}
