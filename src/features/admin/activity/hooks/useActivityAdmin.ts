"use client";

import { useMemo } from "react";
import type { FamilyActivity, ActivityActionType } from "@/types";

import { useActivityData } from "./useActivityData";
import { useActivityFilters } from "./useActivityFilters";
import { useActivitySort } from "./useActivitySort";
import { useActivityGrouping } from "./useActivityGrouping";
import { useSearchFilteredActivities } from "./useSearchFilteredActivities";
import { computeActivityCounts } from "../utils/activityCounts";
import { FILTER_TO_ACTION } from "../utils/activityLabels";

import {
  selectFilterStatus,
  selectSearchTerm,
  selectSortBy,
  selectSetFilterStatus,
  selectSetSearchTerm,
  selectSetSortBy,
  selectResetFilters,
  useActivityFiltersStore,
} from "../stores/useActivityFiltersStore";

import type {
  ActivityCounts,
  ActivityFilterType,
  ActivityGroup,
  ActivitySortBy,
  HiddenBreakdown,
} from "../types";

/**
 * Hook maestro del módulo Activity.
 *
 * Sigue el patrón de `useWeddingAdmin`: combina data cruda + filtros +
 * sort + agrupación + counts y expone un objeto unificado al contexto.
 *
 * Los selectores Zustand son puntuales (no `useStore()` global) para
 * minimizar re-renders, igual que el resto del admin.
 */
export function useActivityAdmin() {
  // ── Datos crudos ──
  const { activities, isLoading, error } = useActivityData();

  // ── Estado de filtros desde Zustand (selectores puntuales) ──
  const searchTerm = useActivityFiltersStore(selectSearchTerm);
  const setSearchTerm = useActivityFiltersStore(selectSetSearchTerm);
  const filterStatus = useActivityFiltersStore(selectFilterStatus);
  const setFilterStatus = useActivityFiltersStore(selectSetFilterStatus);
  const sortBy = useActivityFiltersStore(selectSortBy);
  const setSortBy = useActivityFiltersStore(selectSetSortBy);
  const resetFilters = useActivityFiltersStore(selectResetFilters);

  // ── Pipeline: filtrar → ordenar → agrupar ──
  const filteredActivities = useActivityFilters({
    activities,
    filterStatus,
    searchTerm,
  });

  const sortedActivities = useActivitySort(filteredActivities, sortBy);

  const baseGroups = useActivityGrouping(sortedActivities);

  // ── Conteos para los badges del sidebar ──
  // Se calculan sobre las actividades filtradas SOLO por search (no por action),
  // para que el usuario vea cuántas familias de cada tipo hay dentro de los
  // resultados de su búsqueda actual. Sin esto, al filtrar por "view" el
  // contador de "confirm" quedaría en 0 y resultaría engañoso.
  const searchFilteredActivities = useSearchFilteredActivities(
    activities,
    searchTerm,
  );

  const counts: ActivityCounts = useMemo(
    () => computeActivityCounts(searchFilteredActivities),
    [searchFilteredActivities],
  );

  // ── Flag "isUnanswered" por familia ──
  // Calculado sobre `searchFilteredActivities` (post-search, pre-action-filter)
  // para que el indicador "visto sin responder" sea estable independiente del
  // filtro de acción activo. Si lo calculáramos sobre `filteredActivities`,
  // el flag desaparecería al filtrar por "view" (las actividades de confirm/
  // decline ya no entrarían al cálculo). Lo queremos como dato del
  // estado real de la familia, no del filtro actual.
  const unansweredByFamily = useMemo(() => {
    const flags = new Map<
      string,
      { view: boolean; confirm: boolean; decline: boolean }
    >();
    for (const a of searchFilteredActivities) {
      if (!a.familyId) continue;
      const f = flags.get(a.familyId) ?? {
        view: false,
        confirm: false,
        decline: false,
      };
      f[a.action] = true;
      flags.set(a.familyId, f);
    }
    const result = new Map<string, boolean>();
    for (const [fid, f] of flags) {
      result.set(fid, f.view && !f.confirm && !f.decline);
    }
    return result;
  }, [searchFilteredActivities]);

  // ── Hidden breakdown ──
  // Para cada familia VISIBLE en el grupo actual, contamos cuántas
  // actividades de OTROS tipos tiene en el universo completo (no filtrado).
  // Esto permite mostrar "+2 más (1 confirm, 1 decline)" en la card cuando
  // el filtro activo oculta actividades adicionales.
  //
  // Solo aplica a filtros por acción (confirm/view/decline). "unanswered"
  // es un filtro derivado que ya muestra solo views — no hay nada que ocultar.
  //
  // O(n) sobre el set completo, una sola pasada construyendo un Map.
  const hiddenBreakdownByFamily = useMemo(() => {
    const targetAction =
      filterStatus !== "all" && filterStatus !== "unanswered"
        ? FILTER_TO_ACTION[filterStatus]
        : null;
    if (!targetAction) return new Map<string, HiddenBreakdown>();

    const map = new Map<string, HiddenBreakdown>();
    for (const a of activities) {
      if (a.action === targetAction) continue;
      if (!a.familyId) continue;
      const existing = map.get(a.familyId);
      if (existing) {
        existing[a.action] = (existing[a.action] ?? 0) + 1;
      } else {
        map.set(a.familyId, { [a.action]: 1 } as HiddenBreakdown);
      }
    }
    return map;
  }, [activities, filterStatus]);

  // Inyectamos el `hiddenBreakdown` y `isUnanswered` en cada grupo. Si no
  // hay desglose / flag, devolvemos defaults para mantener la forma estable.
  const groupedActivities: ActivityGroup[] = useMemo(
    () =>
      baseGroups.map((g) => ({
        ...g,
        hiddenBreakdown: hiddenBreakdownByFamily.get(g.familyId) ?? {},
        isUnanswered: unansweredByFamily.get(g.familyId) ?? false,
      })),
    [baseGroups, hiddenBreakdownByFamily, unansweredByFamily],
  );

  const hasActiveFilters =
    filterStatus !== "all" || searchTerm.trim() !== "";

  return {
    // Data cruda
    activities: sortedActivities as FamilyActivity[],
    groupedActivities,
    isLoading,
    error,

    // Filtros + setters
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    resetFilters,
    hasActiveFilters,

    // Conteos
    counts,
  } as const;
}

export type ActivityAdminContextValue = ReturnType<typeof useActivityAdmin>;

// Re-exports de tipos UI-only para conveniencia de consumidores
export type { ActivityFilterType, ActivitySortBy, ActivityActionType };