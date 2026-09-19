import type { ActivityGroup } from "../types";

/**
 * Constantes compartidas entre `ActivityCard` y `ActivityCards` para el
 * layout y dimensionamiento del masonry virtualizado.
 */

/** Gap horizontal y vertical entre cards del masonry (px). */
export const MASONRY_GAP = 12;

/** Ancho mínimo de cada columna (masonic deriva las reales del contenedor). */
export const MASONRY_COLUMN_WIDTH = 280;

/** Altura fija objetivo para cards con scroll interno (>4 actividades). */
export const SCROLL_CARD_HEIGHT = 320;

/** Altura estimada inicial que masonic usa antes de medir las reales. */
export const ITEM_HEIGHT_ESTIMATE = 220;

/** Altura estimada para cards con ≤4 actividades (referencia informativa). */
export function estimateCardHeight(group: ActivityGroup): number {
  if (group.activities.length > 4) return SCROLL_CARD_HEIGHT;
  return 200 + group.activities.length * 38;
}