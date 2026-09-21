"use client";

import { useMemo } from "react";
import type { FamilyActivity } from "@/types";
import type { ActivityGroup } from "../types";

/**
 * Agrupa una lista de FamilyActivity por familyId en una sola pasada O(n).
 *
 * - Construye un `Map<string, FamilyActivity[]>` (preserva orden de aparición).
 * - Dentro de cada grupo, las actividades se ordenan desc por timestamp.
 * - El grupo expone `lastActivityTimestamp` para ordenar cards a nivel familia.
 * - `primaryGuestName` se toma del registro más reciente que tenga `guestName`.
 */
export function useActivityGrouping(
  activities: FamilyActivity[],
): ActivityGroup[] {
  return useMemo(() => {
    const ts = (a: FamilyActivity): number => {
      const t = a.timestamp as unknown;
      if (t instanceof Date) return t.getTime();
      if (
        t &&
        typeof (t as { toMillis?: () => number }).toMillis === "function"
      ) {
        return (t as { toMillis: () => number }).toMillis();
      }
      return Date.parse(String(t ?? 0));
    };

    const map = new Map<string, FamilyActivity[]>();

    for (const a of activities) {
      if (!a.familyId) continue;
      const list = map.get(a.familyId);
      if (list) list.push(a);
      else map.set(a.familyId, [a]);
    }

    const groups: ActivityGroup[] = [];
    for (const [familyId, list] of map) {
      // Orden desc por timestamp dentro del grupo
      const sorted = [...list].sort((a, b) => ts(b) - ts(a));
      // primaryGuestName: primer registro (más reciente) con guestName definido
      const primaryGuestName = sorted.find((a) => a.guestName)?.guestName;
      const familyName = sorted[0]?.familyName || familyId;
      groups.push({
        familyId,
        familyName,
        primaryGuestName,
        activities: sorted,
        hiddenBreakdown: {},
        lastActivityTimestamp: ts(sorted[0]),
        isUnanswered: false,
      });
    }

    return groups;
  }, [activities]);
}
