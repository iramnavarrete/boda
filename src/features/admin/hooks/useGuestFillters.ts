import { useMemo, useState } from "react";
import { FilterType, Guest } from "@/types";
import { isPartialConfirmation } from "@/utils/guest";

export function useGuestsFilter(guests: Guest[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterType>("all");

  const filteredGuests = useMemo(() => {
    if (!guests) return [];

    return guests.filter((g) => {
      // Filtro de búsqueda
      const passSearch =
        searchTerm === "" ||
        g.nombre.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de estado
      // Un invitado con confirmación parcial aparece en "confirmed" Y en "rejected"
      const passStatus =
        filterStatus === "all"
          ? true
          : filterStatus === "confirmed"
            ? g.asistencia === true // parciales incluidos
            : filterStatus === "rejected"
              ? g.asistencia === false || isPartialConfirmation(g) // parciales incluidos
              : filterStatus === "pending"
                ? g.asistencia === null || g.asistencia === undefined
                : true;

      return passSearch && passStatus;
    });
  }, [guests, searchTerm, filterStatus]);

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredGuests,
  };
}
