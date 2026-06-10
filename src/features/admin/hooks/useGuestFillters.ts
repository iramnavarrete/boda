import { useMemo } from "react";
import { Guest } from "@/types";
import { isPartialConfirmation } from "@/utils/guest";
import { useGuestFiltersStore } from "@/features/admin/stores/useGuestFiltersStore";

export function useGuestsFilter(guests: Guest[]) {
  const searchTerm = useGuestFiltersStore((state) => state.searchTerm);
  const filterStatus = useGuestFiltersStore((state) => state.filterStatus);

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

  const setSearchTerm = useGuestFiltersStore((state) => state.setSearchTerm);
  const setFilterStatus = useGuestFiltersStore((state) => state.setFilterStatus);

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredGuests,
  };
}
