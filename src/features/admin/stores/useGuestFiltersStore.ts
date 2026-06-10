import { create } from "zustand";
import { FilterType, WhatsappFilterType, TagFilterType } from "@/types";

interface GuestFiltersState {
  searchTerm: string;
  filterStatus: FilterType;
  whatsappFilter: WhatsappFilterType;
  tagFilter: TagFilterType;
  viewMode: "grid" | "table";

  setSearchTerm: (term: string) => void;
  setFilterStatus: (status: FilterType) => void;
  setWhatsappFilter: (filter: WhatsappFilterType) => void;
  setTagFilter: (filter: TagFilterType) => void;
  setViewMode: (mode: "grid" | "table") => void;
}

export const useGuestFiltersStore = create<GuestFiltersState>((set) => ({
  searchTerm: "",
  filterStatus: "all",
  whatsappFilter: "all",
  tagFilter: "all",
  viewMode: "grid",

  setSearchTerm: (term) => set({ searchTerm: term }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setWhatsappFilter: (filter) => set({ whatsappFilter: filter }),
  setTagFilter: (filter) => set({ tagFilter: filter }),
  setViewMode: (mode) => set({ viewMode: mode }),
}));
