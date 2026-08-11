import { create } from "zustand";
import { FilterType, WhatsappFilterType, TagFilterType } from "@/types";

// 🔥 Definimos el tipo para el nuevo filtro de edición
export type EditionFilterType = "all" | "locked" | "unlocked";

interface FamiliesFiltersState {
  searchTerm: string;
  filterStatus: FilterType;
  whatsappFilter: WhatsappFilterType;
  tagFilter: TagFilterType;
  editionFilter: EditionFilterType; // 🔥 Agregamos el nuevo filtro
  viewMode: "grid" | "table";

  setSearchTerm: (term: string) => void;
  setFilterStatus: (status: FilterType) => void;
  setWhatsappFilter: (filter: WhatsappFilterType) => void;
  setTagFilter: (filter: TagFilterType) => void;
  setEditionFilter: (filter: EditionFilterType) => void; // 🔥 Método para actualizarlo
  setViewMode: (mode: "grid" | "table") => void;
}

export const useFamiliesFiltersStore = create<FamiliesFiltersState>((set) => ({
  searchTerm: "",
  filterStatus: "all",
  whatsappFilter: "all",
  tagFilter: "all",
  editionFilter: "all", // 🔥 Valor por defecto
  viewMode: "grid",

  setSearchTerm: (term) => set({ searchTerm: term }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setWhatsappFilter: (filter) => set({ whatsappFilter: filter }),
  setTagFilter: (filter) => set({ tagFilter: filter }),
  setEditionFilter: (filter) => set({ editionFilter: filter }), // 🔥 Implementación
  setViewMode: (mode) => set({ viewMode: mode }),
}));
