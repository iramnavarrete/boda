import { create } from "zustand";
import { Guest } from "@/types";

interface GuestSelectionState {
  selectedGuests: Set<string>;

  selectGuest: (id: string) => void;
  selectAll: (guests: Guest[]) => void;
  removeFromSelection: (id: string) => void;
  clearSelection: () => void;
}

export const useGuestSelectionStore = create<GuestSelectionState>((set, get) => ({
  selectedGuests: new Set(),

  selectGuest: (id) => {
    set((state) => {
      const next = new Set(state.selectedGuests);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selectedGuests: next };
    });
  },

  selectAll: (guests) => {
    set((state) => {
      const { selectedGuests } = state;
      const newSet =
        selectedGuests.size === guests.length && guests.length > 0
          ? new Set<string>()
          : new Set(guests.map((g) => g.id));
      return { selectedGuests: newSet };
    });
  },

  removeFromSelection: (id) => {
    set((state) => {
      const next = new Set(state.selectedGuests);
      next.delete(id);
      return { selectedGuests: next };
    });
  },

  clearSelection: () => set({ selectedGuests: new Set() }),
}));
