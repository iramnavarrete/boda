import { useMemo } from "react";
import { useSeatingStore } from "../stores/useSeatingStore";
import { TagFilterType } from "@/types";
import {
  SeatingFilterType,
  FamilyElement,
} from "@/types/seating";
import { GuestSeat } from "@/types";
import { useAssignedSeatsMap } from "./useAssignedSeatsMap";

const DECLINED_STATUSES = new Set(["declined", "declinado", "rechazado"]);

/**
 * Item aplanado para la vista "por invitados" del sidebar.
 * Cada item representa un único invitado, con refs a su familia y al
 * estado de asignación para que el componente pueda renderizar y
 * filtrar sin recalcular.
 */
export interface GuestListItem {
  family: FamilyElement;
  guest: GuestSeat;
  /** Posición del invitado dentro de su familia. */
  guestIndex: number;
  isAssigned: boolean;
  isDeclined: boolean;
  /** Solo se usa en el filtro "all" para reordenar. */
  sortPriority?: number;
}

interface UseGuestViewArgs {
  searchQuery: string;
  filter: SeatingFilterType;
  tagFilter: TagFilterType;
}

/**
 * Genera la lista plana de invitados aplicando los mismos filtros
 * que la vista por familias (búsqueda, status, etiqueta).
 *
 * En el filtro "all", el orden es:
 *   0 = declined (requiere atención)
 *   1 = pending (sin asignar)
 *   2 = assigned (resueltos)
 *
 * `items.length` representa el conteo real después de aplicar TODOS
 * los filtros (search + status + tag), así que es la fuente de verdad
 * para mostrar "X personas" en el header.
 */
export function useGuestView({
  searchQuery,
  filter,
  tagFilter,
}: UseGuestViewArgs): GuestListItem[] {
  const families = useSeatingStore((state) => state.families);
  const assignedSeatsMap = useAssignedSeatsMap();

  return useMemo<GuestListItem[]>(() => {
    const search = searchQuery.toLowerCase().trim();
    const result: GuestListItem[] = [];

    for (const f of families) {
      // Filtro por etiqueta (novio/novia/ambos) a nivel familia
      if (tagFilter !== "all" && f.rawFamily.etiqueta !== tagFilter) continue;

      for (let i = 0; i < f.guests.length; i++) {
        const guest = f.guests[i];

        // Filtro por búsqueda: nombre del invitado O nombre de la familia
        if (search) {
          const nameMatch = guest.nombre?.toLowerCase().includes(search);
          const familyMatch = f.name.toLowerCase().includes(search);
          if (!nameMatch && !familyMatch) continue;
        }

        const isAssigned = !!guest.id && assignedSeatsMap.has(guest.id);
        const isDeclined = DECLINED_STATUSES.has(
          (guest.estatus || "").toLowerCase(),
        );

        // Filtro por status (mismas semánticas que en la vista por familia)
        switch (filter) {
          case "assigned":
            if (!isAssigned) continue;
            break;
          case "pending":
            // Pendiente = no asignado y no declinado
            if (isAssigned || isDeclined) continue;
            break;
          case "action":
            // Atención = declinado (slot que puede liberarse)
            if (!isDeclined) continue;
            break;
          case "all":
          default:
            // Sin filtro
            break;
        }

        // Prioridad solo se usa en "all"
        let sortPriority: number | undefined;
        if (filter === "all") {
          if (isDeclined) sortPriority = 0;
          else if (!isAssigned) sortPriority = 1;
          else sortPriority = 2;
        }

        result.push({
          family: f,
          guest,
          guestIndex: i,
          isAssigned,
          isDeclined,
          sortPriority,
        });
      }
    }

    if (filter === "all") {
      result.sort((a, b) => (a.sortPriority ?? 99) - (b.sortPriority ?? 99));
    }

    return result;
  }, [families, assignedSeatsMap, filter, searchQuery, tagFilter]);
}

