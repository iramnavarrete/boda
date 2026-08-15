"use client";

import { useMemo } from "react";
import { useSeatingStore } from "../stores/useSeatingStore";

/**
 * Devuelve un Set O(1) con los IDs seleccionados.
 *
 * Cada TableElement hacía `selectedElementIds.includes(id)` (O(n)) en cada render.
 * Con un Set, esa operación pasa a ser O(1).
 * El Set se reconstruye solo cuando el array de IDs cambia.
 */
export function useSelectedIdsSet(): Set<string> {
  const ids = useSeatingStore((state) => state.selectedElementIds);
  return useMemo(() => new Set(ids), [ids]);
}
