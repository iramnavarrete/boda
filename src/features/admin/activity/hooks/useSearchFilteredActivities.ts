"use client";

import { useMemo } from "react";
import type { FamilyActivity, ActivityActionType } from "@/types";
import { useActivityFilters } from "./useActivityFilters";

/**
 * Actividades filtradas SOLO por search term (ignorando filterStatus).
 *
 * Se usa para calcular los counts del sidebar: el usuario debe ver cuántos
 * items de cada tipo hay DENTRO de su búsqueda actual, no los totales.
 *
 * Internamente delega en `useActivityFilters` con `filterStatus: "all"`.
 */
export function useSearchFilteredActivities(
  activities: FamilyActivity[],
  searchTerm: string,
): FamilyActivity[] {
  const filtered = useActivityFilters({
    activities,
    filterStatus: "all" as ActivityActionType,
    searchTerm,
  });

  // Mantenemos la misma referencia si los inputs no cambian
  return useMemo(() => filtered, [filtered]);
}