import { useMemo, useState } from "react";
import { FilterCounts, FilterType, Guest } from "@/types";

export function useGuestsFilter(guests: Guest[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterType>("all");

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchesSearch = g.nombre
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      let matchesFilter = true;
      if (filterStatus === "confirmed") matchesFilter = g.asistencia === true;
      else if (filterStatus === "rejected")
        matchesFilter = g.asistencia === false;
      else if (filterStatus === "pending")
        matchesFilter = g.asistencia === null || g.asistencia === undefined;
      return matchesSearch && matchesFilter;
    });
  }, [guests, searchTerm, filterStatus]);

  const filterCounts: FilterCounts = useMemo(() => {
    return guests.reduce(
      (acc, curr) => ({
        all: acc.all + 1,
        confirmed: acc.confirmed + (curr.asistencia === true ? 1 : 0),
        rejected: acc.rejected + (curr.asistencia === false ? 1 : 0),
        pending:
          acc.pending +
          (curr.asistencia === null || curr.asistencia === undefined ? 1 : 0),
      }),
      { all: 0, confirmed: 0, rejected: 0, pending: 0 }
    );
  }, [guests]);

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredGuests,
    filterCounts,
  };
}
