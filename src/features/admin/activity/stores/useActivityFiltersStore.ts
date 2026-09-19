import { create } from "zustand";
import type { ActivityFilterType, ActivitySortBy } from "../types";

interface ActivityFiltersState {
  searchTerm: string;
  filterStatus: ActivityFilterType;
  sortBy: ActivitySortBy;

  setSearchTerm: (term: string) => void;
  setFilterStatus: (status: ActivityFilterType) => void;
  setSortBy: (sort: ActivitySortBy) => void;
  /** Restaura todos los filtros a sus valores por defecto. */
  resetFilters: () => void;
}

const DEFAULTS = {
  searchTerm: "",
  filterStatus: "all" as ActivityFilterType,
  sortBy: "recent" as ActivitySortBy,
};

export const useActivityFiltersStore = create<ActivityFiltersState>((set) => ({
  ...DEFAULTS,
  setSearchTerm: (term) => set({ searchTerm: term }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setSortBy: (sort) => set({ sortBy: sort }),
  resetFilters: () => set({ ...DEFAULTS }),
}));

// Selectores puntuales reutilizables (evitan re-renders innecesarios
// al usar el hook con selector genérico `useActivityFiltersStore()`).
export const selectSearchTerm = (s: ActivityFiltersState) => s.searchTerm;
export const selectFilterStatus = (s: ActivityFiltersState) => s.filterStatus;
export const selectSortBy = (s: ActivityFiltersState) => s.sortBy;
export const selectSetSearchTerm = (s: ActivityFiltersState) => s.setSearchTerm;
export const selectSetFilterStatus = (s: ActivityFiltersState) =>
  s.setFilterStatus;
export const selectSetSortBy = (s: ActivityFiltersState) => s.setSortBy;
export const selectResetFilters = (s: ActivityFiltersState) => s.resetFilters;