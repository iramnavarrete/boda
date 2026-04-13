import { useMemo, useState } from "react";
import { FilterType, Guest } from "@/types";
import { isPartialConfirmation } from "@/utils/guest";

export function useGuestsFilter(guests: Guest[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterType>("all");

  const filteredGuests = useMemo(() => {
    if (!guests) return [];

    return guests.filter((g) => {
      const passSearch =
        searchTerm === "" ||
        g.nombre.toLowerCase().includes(searchTerm.toLowerCase());

      let passStatus = true;

      switch (filterStatus) {
        case "confirmed":
          passStatus = g.asistencia === true && g.confirmados === g.invitados;
          break;

        case "partial":
          passStatus = isPartialConfirmation(g);
          break;

        case "rejected":
          passStatus =
            g.asistencia === false ||
            (g.asistencia === true && g.confirmados === 0);
          break;

        case "pending":
          passStatus = g.asistencia === null || g.asistencia === undefined;
          break;

        case "all":
        default:
          passStatus = true;
          break;
      }

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
