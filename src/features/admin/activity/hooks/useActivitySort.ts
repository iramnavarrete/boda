"use client";

import { useMemo } from "react";
import type { FamilyActivity } from "@/types";
import type { ActivitySortBy } from "../types";

/**
 * Ordena una lista de FamilyActivity por timestamp.
 *
 * `"recent"` → desc (más reciente primero)
 * `"oldest"` → asc (más antiguo primero)
 *
 * No muta el array de entrada; retorna una copia defensiva.
 */
export function useActivitySort(
  activities: FamilyActivity[],
  sortBy: ActivitySortBy,
) {
  return useMemo(() => {
    const ts = (a: FamilyActivity): number => {
      // `Timestamp` expone `toMillis()`. Si por algún motivo llega un
      // objeto sin esa firma, usamos fallback a `Date.parse`.
      const t = a.timestamp as unknown;
      if (t instanceof Date) return t.getTime();
      if (t && typeof (t as { toMillis?: () => number }).toMillis === "function") {
        return (t as { toMillis: () => number }).toMillis();
      }
      return Date.parse(String(t ?? 0));
    };

    const copy = [...activities];
    copy.sort((a, b) => {
      const diff = ts(b) - ts(a);
      return sortBy === "recent" ? diff : -diff;
    });
    return copy;
  }, [activities, sortBy]);
}