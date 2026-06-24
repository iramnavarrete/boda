import { create } from "zustand";

export type ElementType =
  | "round_table"
  | "rectangular_table"
  | "square_table"
  | "half_moon_table"
  | "cocktail_table"
  | "head_table"
  | "dance_floor"
  | "stage"
  | "dj_booth"
  | "cake_area"
  | "gift_table"
  | "drink_bar"
  | "buffet"
  | "candy_bar";

export interface SeatingElement {
  id: string;
  type: ElementType;
  alias: string;
  x: number;
  y: number;
  width: number;
  height: number;
  seats: number;
  assignedSeats: string[];
}

export interface Guest {
  id: string;
  name: string;
}

export interface Family {
  id: string;
  name: string;
  guests: Guest[];
}

interface SeatingStore {
  elements: SeatingElement[];
  families: Family[];
  zoom: number;
  canvasOffset: { x: number; y: number };
  selectedElementId: string | null;
  addElement: (
    element: Omit<SeatingElement, "assignedSeats" | "alias">,
    alias: string,
  ) => void;
  removeElement: (id: string) => void;
  updateElementPosition: (id: string, x: number, y: number) => void;
  updateElementSeats: (id: string, seats: number) => void;
  updateElementAlias: (id: string, alias: string) => void;
  assignGuestToTable: (tableId: string, guestId: string) => void;
  assignFamilyToTable: (tableId: string, familyId: string) => void;
  removeGuestFromTable: (tableId: string, guestId: string) => void;
  removeFamilyFromTable: (familyId: string) => void;
  updateGuestName: (familyId: string, guestId: string, name: string) => void;
  setZoom: (zoom: number) => void;
  setCanvasOffset: (offset: { x: number; y: number }) => void;
  setSelectedElementId: (id: string | null) => void;
}

const MOCK_FAMILIES: Family[] = [
  {
    id: "fam_1",
    name: "Familia Pérez",
    guests: [
      { id: "g_1", name: "" },
      { id: "g_2", name: "" },
      { id: "g_3", name: "" },
      { id: "g_4", name: "" },
    ],
  },
  {
    id: "fam_2",
    name: "Familia Gómez",
    guests: [
      { id: "g_5", name: "" },
      { id: "g_6", name: "" },
    ],
  },
  {
    id: "fam_3",
    name: "Familia López",
    guests: [
      { id: "g_7", name: "" },
      { id: "g_8", name: "" },
      { id: "g_9", name: "" },
    ],
  },
  {
    id: "fam_4",
    name: "Amigos Novio",
    guests: [
      { id: "g_10", name: "" },
      { id: "g_11", name: "" },
      { id: "g_12", name: "" },
    ],
  },
];

export const useSeatingStore = create<SeatingStore>((set) => ({
  elements: [],
  families: MOCK_FAMILIES,
  zoom: 1,
  canvasOffset: { x: 0, y: 0 },
  selectedElementId: null,

  addElement: (element, alias) =>
    set((state) => ({
      elements: [...state.elements, { ...element, alias, assignedSeats: [] }],
      selectedElementId: element.id,
    })),

  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementId:
        state.selectedElementId === id ? null : state.selectedElementId,
    })),

  updateElementPosition: (id, x, y) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, x, y } : el,
      ),
    })),

  updateElementSeats: (id, seats) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, seats } : el,
      ),
    })),

  updateElementAlias: (id, alias) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, alias } : el,
      ),
    })),

  assignGuestToTable: (tableId, guestId) =>
    set((state) => ({
      elements: state.elements.map((el) => {
        const filteredSeats = el.assignedSeats.filter((s) => s !== guestId);
        if (el.id === tableId && filteredSeats.length < el.seats) {
          return { ...el, assignedSeats: [...filteredSeats, guestId] };
        }
        return { ...el, assignedSeats: filteredSeats };
      }),
    })),

  assignFamilyToTable: (tableId, familyId) =>
    set((state) => {
      const family = state.families.find((f) => f.id === familyId);
      if (!family) return state;
      const guestIds = family.guests.map((g) => g.id);

      let nextState = state.elements.map((el) => ({
        ...el,
        assignedSeats: el.assignedSeats.filter((s) => !guestIds.includes(s)),
      }));

      nextState = nextState.map((el) => {
        if (el.id === tableId) {
          const available = el.seats - el.assignedSeats.length;
          const toAdd = guestIds.slice(0, available);
          return { ...el, assignedSeats: [...el.assignedSeats, ...toAdd] };
        }
        return el;
      });

      return { elements: nextState };
    }),

  removeGuestFromTable: (tableId, guestId) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === tableId
          ? {
              ...el,
              assignedSeats: el.assignedSeats.filter((s) => s !== guestId),
            }
          : el,
      ),
    })),

  removeFamilyFromTable: (familyId) =>
    set((state) => {
      const family = state.families.find((f) => f.id === familyId);
      if (!family) return state;
      const guestIds = family.guests.map((g) => g.id);
      return {
        elements: state.elements.map((el) => ({
          ...el,
          assignedSeats: el.assignedSeats.filter((s) => !guestIds.includes(s)),
        })),
      };
    }),

  updateGuestName: (familyId, guestId, name) =>
    set((state) => ({
      families: state.families.map((f) =>
        f.id === familyId
          ? {
              ...f,
              guests: f.guests.map((g) =>
                g.id === guestId ? { ...g, name } : g,
              ),
            }
          : f,
      ),
    })),

  setZoom: (zoom) => set({ zoom }),
  setCanvasOffset: (canvasOffset) => set({ canvasOffset }),
  setSelectedElementId: (id) => set({ selectedElementId: id }),
}));
