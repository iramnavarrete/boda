import type { FamilyActivity, ActivityActionType } from "@/types";

/**
 * Tipos UI-locales para la feature "Activity".
 *
 * NOTA: NO se exportan a `types/types.d.ts` porque son específicos de esta
 * vista. El contrato de datos hacia Firestore sigue siendo `FamilyActivity` /
 * `ActivityActionType`.
 */

/** Filtro del sidebar por tipo de actividad a nivel de actividad.
 *
 * - `all` → sin filtro
 * - `confirm` → familias con ≥1 confirmación
 * - `view` → familias con ≥1 visualización
 * - `decline` → familias con ≥1 rechazo
 * - `unanswered` → familias que vieron pero NO confirmaron ni rechazaron
 */
export type ActivityFilterType =
  | "all"
  | "confirm"
  | "view"
  | "decline"
  | "unanswered";

/** Criterio de orden para los grupos/familias. */
export type ActivitySortBy = "recent" | "oldest";

/**
 * Conteo de actividades de una familia que están OCULTAS por el filtro
 * activo, desglosado por tipo. Usado por la card para mostrar "+N más" y
 * el desglose (ej: "1 confirm, 1 decline").
 */
export type HiddenBreakdown = Partial<Record<ActivityActionType, number>>;

/**
 * Una familia agrupada con su lista de actividades ordenadas desc por timestamp.
 * Derivado en runtime desde `FamilyActivity[]` (ver `useActivityGrouping`).
 *
 * - `activities`: actividades VISIBLES (las que pasan el filtro activo).
 * - `hiddenBreakdown`: cuentas de actividades de OTROS tipos que pertenecen
 *   a esta familia pero no se muestran. Vacío cuando no hay filtro o cuando
 *   la familia solo tiene actividades del tipo filtrado.
 */
export interface ActivityGroup {
  familyId: string;
  familyName: string;
  primaryGuestName?: string;
  activities: FamilyActivity[];
  hiddenBreakdown: HiddenBreakdown;
  /** Timestamp (ms epoch) de la actividad más reciente del grupo (visible u oculta). */
  lastActivityTimestamp: number;
}

/**
 * Conteos por categoría, calculados sobre familias únicas.
 * Una familia cuenta para N categorías si tiene actividades de N tipos.
 */
export interface ActivityCounts {
  all: number;
  confirm: number;
  view: number;
  decline: number;
  /** Familias con ≥1 view pero SIN confirm ni decline. */
  unanswered: number;
}