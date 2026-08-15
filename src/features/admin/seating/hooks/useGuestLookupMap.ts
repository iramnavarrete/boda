"use client";

import { useMemo } from "react";
import { useSeatingStore } from "../stores/useSeatingStore";
import { FamilyElement } from "@/types/seating";
import { GuestStatus } from "@/types";

export interface GuestLookupInfo {
  id: string;
  nombre: string;
  estatus: GuestStatus;
  familyId: string;
  familyName: string;
  colorBg: string;
  colorBorder: string;
  /** Posición del invitado dentro de la familia (0-based). */
  index: number;
}

export type GuestLookupMap = Map<string, GuestLookupInfo>;

/**
 * Construye un Map O(1) de guestId -> info del invitado, evitando
 * recorrer el array de familias y guests en cada render.
 *
 * Reemplaza los loops anidados que existían en TableElement, TableSeat
 * y TableSettingsPopover. Solo se recalcula cuando `families` cambia.
 */
export function useGuestLookupMap(): GuestLookupMap {
  const families = useSeatingStore((state) => state.families);

  return useMemo(() => {
    const map: GuestLookupMap = new Map();

    for (const f of families as FamilyElement[]) {
      const guests = f.guests;
      for (let i = 0; i < guests.length; i++) {
        const g = guests[i];
        map.set(g.id, {
          id: g.id,
          nombre: g.nombre,
          estatus: (g.estatus as GuestStatus) || "pending",
          familyId: f.id,
          familyName: f.name,
          colorBg: f.colorBg,
          colorBorder: f.colorBorder,
          index: i,
        });
      }
    }

    return map;
  }, [families]);
}
