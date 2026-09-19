"use client";

import { useMemo } from "react";
import type { FamilyActivity } from "@/types";
import type { ActivityFilterType } from "../types";
import { FILTER_TO_ACTION } from "../utils/activityLabels";

export interface UseActivityFiltersParams {
  activities: FamilyActivity[];
  filterStatus: ActivityFilterType;
  searchTerm: string;
}

/**
 * Aplica los filtros del sidebar sobre la lista cruda de actividades.
 *
 * Reglas:
 * - `filterStatus === "all"` → conserva todas (sujeto a search).
 * - `filterStatus` ∈ {confirm, view, decline} → conserva solo actividades
 *   cuya `action` coincida. Familias con múltiples tipos aparecen en varios
 *   filtros (semántica "a nivel actividad").
 * - `filterStatus === "unanswered"` → conserva solo las actividades de tipo
 *   `view` que pertenecen a familias con ≥1 view y NINGÚN confirm ni decline.
 * - `searchTerm` no vacío → match case-insensitive contra `familyName`
 *   o `guestName` de la actividad.
 *
 * O(n) — una sola pasada precomputa los flags por familia.
 */
export function useActivityFilters({
  activities,
  filterStatus,
  searchTerm,
}: UseActivityFiltersParams) {
  return useMemo(() => {
    const trimmed = searchTerm.trim().toLowerCase();

    // Acción objetivo (null si el filtro es "all" o "unanswered")
    const targetAction =
      filterStatus !== "all" && filterStatus !== "unanswered"
        ? FILTER_TO_ACTION[filterStatus]
        : null;

    // Para "unanswered": precomputar flags por familia en una sola pasada.
    // Set de familyIds que tienen view pero NO tienen confirm ni decline.
    let unansweredFamilies: Set<string> | null = null;
    if (filterStatus === "unanswered") {
      const flags = new Map<
        string,
        { view: boolean; confirm: boolean; decline: boolean }
      >();
      for (const a of activities) {
        if (!a.familyId) continue;
        const f = flags.get(a.familyId) ?? {
          view: false,
          confirm: false,
          decline: false,
        };
        f[a.action] = true;
        flags.set(a.familyId, f);
      }
      unansweredFamilies = new Set<string>();
      for (const [fid, f] of flags) {
        if (f.view && !f.confirm && !f.decline) {
          unansweredFamilies.add(fid);
        }
      }
    }

    return activities.filter((a) => {
      // Filtro de status
      if (filterStatus === "unanswered") {
        if (a.action !== "view") return false;
        if (!unansweredFamilies?.has(a.familyId)) return false;
      } else if (targetAction && a.action !== targetAction) {
        return false;
      }

      // Filtro de search
      if (trimmed) {
        const familyName = (a.familyName || "").toLowerCase();
        const guestName = (a.guestName || "").toLowerCase();
        if (!familyName.includes(trimmed) && !guestName.includes(trimmed)) {
          return false;
        }
      }

      return true;
    });
  }, [activities, filterStatus, searchTerm]);
}