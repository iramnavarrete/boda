import { useMemo, useState } from "react";
import { useSeatingStore } from "../stores/useSeatingStore";
import { TagFilterType } from "@/types";
import { SeatingFilterType, FamilyElement } from "@/types/seating";

const DECLINED_STATUSES = new Set(["declined", "declinado", "rechazado"]);

export interface FamilyWithCounts {
  family: FamilyElement;
  assignedCount: number;
  declinedCount: number;
  totalGuests: number;
}

export function useGuestAssignment(tagFilter: TagFilterType = "all") {
  const families = useSeatingStore((state) => state.families);
  const elements = useSeatingStore((state) => state.elements);

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<SeatingFilterType>("all");

  const assignedGuestIds = useMemo(() => {
    const ids = new Set<string>();
    for (const el of elements) {
      const seats = el.assignedSeats;
      for (let i = 0; i < seats.length; i++) {
        const id = seats[i];
        if (id) ids.add(id);
      }
    }
    return ids;
  }, [elements]);

  const stats = useMemo(() => {
    let totalGuests = 0;
    let assignedGuests = 0;

    for (const f of families) {
      totalGuests += f.guests.length;
      for (const g of f.guests) {
        if (assignedGuestIds.has(g.id)) assignedGuests++;
      }
    }

    let totalSeats = 0;
    let occupiedSeats = 0;

    for (const el of elements) {
      if (el.seats && el.seats > 0) {
        totalSeats += el.seats;
        for (const s of el.assignedSeats) {
          if (s) occupiedSeats++;
        }
      }
    }

    return {
      guests: {
        total: totalGuests,
        assigned: assignedGuests,
        pending: totalGuests - assignedGuests,
      },
      seats: {
        total: totalSeats,
        occupied: occupiedSeats,
        available: totalSeats - occupiedSeats,
      },
    };
  }, [families, assignedGuestIds, elements]);

  // Una sola pasada: calcula assignedCount + declinedCount por familia y filtra.
  const familiesWithCounts = useMemo<FamilyWithCounts[]>(() => {
    const search = searchQuery.toLowerCase();
    const result: FamilyWithCounts[] = [];

    for (const f of families) {
      // Filtro por búsqueda
      if (search && !f.name.toLowerCase().includes(search)) continue;

      // Filtro por etiqueta (novio, novia, ambos)
      if (tagFilter !== "all" && f.rawFamily.etiqueta !== tagFilter) continue;

      const guests = f.guests;
      const totalGuests = guests.length;
      if (totalGuests === 0) continue;

      let assignedCount = 0;
      let declinedCount = 0;
      for (const g of guests) {
        if (assignedGuestIds.has(g.id)) assignedCount++;
        if (DECLINED_STATUSES.has((g.estatus || "").toLowerCase())) {
          declinedCount++;
        }
      }

      // Lógica de filtro por color.
      // Verde: todos asignados Y ninguno declined.
      // Naranja: faltan asientos por asignar, O todos asignados pero
      //          al menos uno es declined (requiere liberar slot).
      // Amarillo: nadie asignado, nadie declined — todo pendiente.
      const isGreen = assignedCount === totalGuests && declinedCount === 0;
      const isOrange = !isGreen && (assignedCount > 0 || declinedCount > 0);
      const isYellow = assignedCount === 0 && declinedCount === 0;

      switch (filter) {
        case "assigned":
          if (!isGreen) continue;
          break;
        case "pending":
          if (!isYellow) continue;
          break;
        case "action":
          if (!isOrange) continue;
          break;
        case "all":
        default:
          break;
      }

      result.push({
        family: f,
        assignedCount,
        declinedCount,
        totalGuests,
      });
    }

    return result;
  }, [families, assignedGuestIds, filter, searchQuery, tagFilter]);

  return {
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    stats,
    assignedGuestIds,
    familiesWithCounts,
  };
}
