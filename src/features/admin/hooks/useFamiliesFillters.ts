import { useMemo } from "react";
import { Family } from "@/types";
import { isPartialConfirmation } from "@/utils/family";
import { useFamiliesFiltersStore } from "@/features/admin/stores/useFamiliesFiltersStore";

export function useFamiliesFiltes(families: Family[]) {
  const searchTerm = useFamiliesFiltersStore((state) => state.searchTerm);
  const filterStatus = useFamiliesFiltersStore((state) => state.filterStatus);

  const filteredFamilies = useMemo(() => {
    if (!families) return [];

    return families.filter((g) => {
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
  }, [families, searchTerm, filterStatus]);

  const setSearchTerm = useFamiliesFiltersStore((state) => state.setSearchTerm);
  const setFilterStatus = useFamiliesFiltersStore(
    (state) => state.setFilterStatus,
  );

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredFamilies,
  };
}
