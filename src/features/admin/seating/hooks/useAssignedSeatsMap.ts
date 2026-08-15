"use client";

import { useMemo } from "react";
import { useSeatingStore } from "../stores/useSeatingStore";
import { SeatingElement } from "@/types/seating";

export interface AssignedSeatInfo {
  tableId: string;
  tableAlias: string;
  seatNumber: number;
}

export type AssignedSeatsMap = Map<string, AssignedSeatInfo>;

/**
 * Construye un Map O(1) de guestId -> { tableId, tableAlias, seatNumber }.
 *
 * Reemplaza las búsquedas `elements.find(el => el.assignedSeats.includes(guestId))`
 * que se ejecutaban en cada render del sidebar (DraggableFamily/DraggableGuest).
 */
export function useAssignedSeatsMap(): AssignedSeatsMap {
  const elements = useSeatingStore((state) => state.elements);

  return useMemo(() => {
    const map: AssignedSeatsMap = new Map();

    for (const el of elements as SeatingElement[]) {
      const seats = el.assignedSeats;
      for (let i = 0; i < seats.length; i++) {
        const gid = seats[i];
        if (!gid) continue;
        map.set(gid, {
          tableId: el.id,
          tableAlias: el.alias,
          seatNumber: i + 1,
        });
      }
    }

    return map;
  }, [elements]);
}
