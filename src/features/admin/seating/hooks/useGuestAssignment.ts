import { useMemo, useState } from "react";
import { useSeatingStore } from "../stores/useSeatingStore";

export type FilterType = "all" | "pending" | "assigned" | "action";

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
    let filtered = families;

    if (searchQuery) {
      filtered = filtered.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered.filter((family) => {
      const totalGuests = family.guests.length;
      if (totalGuests === 0) return false;

      const assignedCount = family.guests.filter((g) =>
        assignedGuestIds.has(g.id),
      ).length;

      const declinedCount = family.guests.filter((g) => {
        const status = (g.estatus || "").toLowerCase();
        return ["declinado", "rechazado", "declined"].includes(status);
      }).length;

      // Evaluamos los 3 estados exactos de los colores:
      const isGreen = assignedCount === totalGuests; // 100% asignados
      const isOrange =
        declinedCount > 0 || (assignedCount > 0 && assignedCount < totalGuests); // A medias o declinados
      const isYellow = assignedCount === 0 && declinedCount === 0; // Frescos, nadie sentado

      switch (filter) {
        case "assigned":
          return isGreen; // Solo los verdes
        case "pending":
          return isYellow; // Solo los amarillos
        case "action": // Antes llamado "declined"
          return isOrange; // Solo los naranjas
        case "all":
        default:
          return true;
      }
    });
  }, [families, assignedGuestIds, filter, searchQuery]);

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
