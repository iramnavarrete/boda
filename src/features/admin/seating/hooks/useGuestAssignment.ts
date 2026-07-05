import { useMemo, useState } from "react";
import { useSeatingStore } from "../stores/useSeatingStore";

export type FilterType = "all" | "pending" | "assigned";

export function useGuestAssignment() {
  const families = useSeatingStore((state) => state.families);
  const elements = useSeatingStore((state) => state.elements);

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const assignedGuestIds = useMemo(() => {
    const ids = new Set<string>();
    elements.forEach((el) => {
      el.assignedSeats.forEach((id) => {
        if (id && id !== "") ids.add(id);
      });
    });
    return ids;
  }, [elements]);

  const stats = useMemo(() => {
    let totalGuests = 0;
    let assignedGuests = 0;

    families.forEach((f) => {
      totalGuests += f.guests.length;
      f.guests.forEach((g) => {
        if (assignedGuestIds.has(g.id)) assignedGuests++;
      });
    });

    let totalSeats = 0;
    let occupiedSeats = 0;

    elements.forEach((el) => {
      if (el.seats && el.seats > 0) {
        totalSeats += el.seats;
        occupiedSeats += el.assignedSeats.filter((s) => s && s !== "").length;
      }
    });

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

  const filteredAndSortedFamilies = useMemo(() => {
    return families
      .filter((f) => {
        // Filtro por Búsqueda (Buscador)
        if (
          searchQuery &&
          !f.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Determinar el estado de asignación
        const assignedCount = f.guests.filter((g) =>
          assignedGuestIds.has(g.id),
        ).length;
        const isFullyAssigned =
          f.guests.length > 0 && assignedCount === f.guests.length;

        // Filtro por Tabs
        if (filter === "assigned" && !isFullyAssigned) return false;
        if (filter === "pending" && isFullyAssigned) return false;

        return true;
      })
      .sort((a, b) => {
        const aAssigned =
          a.guests.length > 0 &&
          a.guests.every((g) => assignedGuestIds.has(g.id));
        const bAssigned =
          b.guests.length > 0 &&
          b.guests.every((g) => assignedGuestIds.has(g.id));

        if (aAssigned && !bAssigned) return 1;
        if (!aAssigned && bAssigned) return -1;
        return 0;
      });
  }, [families, searchQuery, filter, assignedGuestIds]);

  return {
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    stats,
    assignedGuestIds,
    filteredAndSortedFamilies,
  };
}
