import { create } from "zustand";
import { Family } from "@/types";

interface FamiliesSelectionState {
  selectedFamilies: Set<string>;

  selectFamily: (id: string) => void;
  selectAll: (families: Family[]) => void;
  removeFromSelection: (id: string) => void;
  clearSelection: () => void;
}

export const useFamiliesSelectionStore = create<FamiliesSelectionState>(
  (set) => ({
    selectedFamilies: new Set(),

    selectFamily: (id) => {
      set((state) => {
        const next = new Set(state.selectedFamilies);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return { selectedFamilies: next };
      });
    },

    selectAll: (families) => {
      set((state) => {
        const { selectedFamilies } = state;
        const newSet =
          selectedFamilies.size === families.length && families.length > 0
            ? new Set<string>()
            : new Set(families.map((g) => g.id));
        return { selectedFamilies: newSet };
      });
    },

    removeFromSelection: (id) => {
      set((state) => {
        const next = new Set(state.selectedFamilies);
        next.delete(id);
        return { selectedFamilies: next };
      });
    },

    clearSelection: () => set({ selectedFamilies: new Set() }),
  }),
);
