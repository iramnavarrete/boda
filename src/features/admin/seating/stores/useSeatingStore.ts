import { GuestService } from "@/services/guestService";
import { GuestFormData } from "@/types";
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

export type GuestStatus = "confirmed" | "pending" | "declined";

export interface Guest {
  id: string;
  name: string;
  status: GuestStatus;
}

export interface Family {
  id: string;
  name: string;
  deadline: string | null;
  aliases: string[];
  colorBg: string;
  colorBorder: string;
  guests: Guest[];
  hasUnsavedChanges?: boolean;
}

export interface SeatingStore {
  elements: SeatingElement[];
  families: Family[];
  zoom: number;
  canvasOffset: { x: number; y: number };
  selectedElementId: string | null;
  toastMsg: string | null;
  isInitialized: boolean;
  hasUnsavedChanges: boolean;

  initialize: (dbElements: SeatingElement[], dbFamilies: Family[]) => void;
  markSaved: () => void;
  addElement: (
    element: Omit<SeatingElement, "assignedSeats" | "alias">,
    alias: string,
  ) => void;
  removeElement: (id: string) => void;
  updateElementPosition: (id: string, x: number, y: number) => void;
  updateElementGeometry: (
    id: string,
    width: number,
    height: number,
    x: number,
    y: number,
  ) => void;
  updateElementSeats: (id: string, seats: number) => void;
  updateElementAlias: (id: string, alias: string) => void;
  assignGuestToTable: (tableId: string, guestId: string) => void;
  assignFamilyToTable: (tableId: string, familyId: string) => void;
  removeGuestFromTable: (tableId: string, guestId: string) => void;
  removeFamilyFromTable: (familyId: string) => void;
  updateGuestName: (familyId: string, guestId: string, name: string) => void;
  clearFamilyUnsavedChanges: (familyId: string) => void;

  executeRemoveSeat: (
    invitationId: string,
    familyId: string,
    guestId: string,
  ) => Promise<void>;
  executeDeleteFamily: (
    invitationId: string,
    familyId: string,
  ) => Promise<void>;
  executeAddSeatToFamily: (
    invitationId: string,
    familyId: string,
  ) => Promise<void>;

  setZoom: (zoom: number) => void;
  setCanvasOffset: (offset: { x: number; y: number }) => void;
  setSelectedElementId: (id: string | null) => void;
  showToast: (msg: string) => void;
  addLayoutElements: (newElements: SeatingElement[]) => void;
  selectedElementIds: string[]; // Para selección múltiple
  setSelectedElementIds: (ids: string[]) => void;
  removeMultipleElements: (ids: string[]) => void;
}

export const generateFamilyColors = (
  families: Omit<Family, "colorBg" | "colorBorder">[],
): Family[] => {
  return families.map((fam, i) => {
    const hue = Math.floor((i * (360 / families.length)) % 360);
    return {
      ...fam,
      colorBg: `hsl(${hue}, 80%, 85%)`,
      colorBorder: `hsl(${hue}, 70%, 65%)`,
    };
  });
};

let toastTimeout: ReturnType<typeof setTimeout>;

export const useSeatingStore = create<SeatingStore>((set, get) => ({
  elements: [],
  families: [],
  zoom: 1,
  canvasOffset: { x: 0, y: 0 },
  selectedElementId: null,
  toastMsg: null,
  isInitialized: false,
  hasUnsavedChanges: false,

  initialize: (dbElements, dbFamilies) =>
    set({
      elements: dbElements,
      families: dbFamilies,
      isInitialized: true,
      hasUnsavedChanges: false,
    }),

  markSaved: () =>
    set((state) => ({
      hasUnsavedChanges: false,
      families: state.families.map((f) => ({ ...f, hasUnsavedChanges: false })),
    })),

  showToast: (msg) => {
    set({ toastMsg: msg });
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => set({ toastMsg: null }), 3500);
  },

  addElement: (element, alias) =>
    set((state) => ({
      elements: [...state.elements, { ...element, alias, assignedSeats: [] }],
      selectedElementId: element.id,
      hasUnsavedChanges: true,
    })),

  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementId:
        state.selectedElementId === id ? null : state.selectedElementId,
      hasUnsavedChanges: true,
    })),

  updateElementPosition: (id, x, y) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, x, y } : el,
      ),
      hasUnsavedChanges: true,
    })),

  updateElementGeometry: (id, width, height, x, y) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, width, height, x, y } : el,
      ),
      hasUnsavedChanges: true,
    })),

  updateElementSeats: (id, seats) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, seats } : el,
      ),
      hasUnsavedChanges: true,
    })),

  updateElementAlias: (id, alias) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, alias } : el,
      ),
      hasUnsavedChanges: true,
    })),

  assignGuestToTable: (tableId, guestId) =>
    set((state) => ({
      elements: state.elements.map((el) => {
        const filteredSeats = el.assignedSeats.filter((s) => s !== guestId);
        if (el.id === tableId && filteredSeats.length < el.seats)
          return { ...el, assignedSeats: [...filteredSeats, guestId] };
        return { ...el, assignedSeats: filteredSeats };
      }),
      hasUnsavedChanges: true,
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
      return { elements: nextState, hasUnsavedChanges: true };
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
      hasUnsavedChanges: true,
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
        hasUnsavedChanges: true,
      };
    }),

  updateGuestName: (familyId, guestId, name) =>
    set((state) => ({
      hasUnsavedChanges: true,
      families: state.families.map((f) => {
        if (f.id === familyId) {
          const guestIndex = f.guests.findIndex((g) => g.id === guestId);
          const newAliases = [...(f.aliases || [])];
          for (let i = 0; i <= guestIndex; i++) {
            if (newAliases[i] === undefined) {
              newAliases[i] = "";
            }
          }
          newAliases[guestIndex] = name || "";

          return {
            ...f,
            aliases: newAliases,
            hasUnsavedChanges: true,
            guests: f.guests.map((g) =>
              g.id === guestId ? { ...g, name: name || "" } : g,
            ),
          };
        }
        return f;
      }),
    })),

  clearFamilyUnsavedChanges: (familyId) =>
    set((state) => ({
      families: state.families.map((f) =>
        f.id === familyId ? { ...f, hasUnsavedChanges: false } : f,
      ),
    })),

  executeRemoveSeat: async (
    invitationId: string,
    familyId: string,
    guestId: string,
  ) => {
    const state = get();
    await GuestService.reduceGuestCount(invitationId, familyId);

    const currentTable = state.elements.find((el) =>
      el.assignedSeats.includes(guestId),
    );
    if (currentTable) {
      state.removeGuestFromTable(currentTable.id, guestId);
    }

    set((currentState) => ({
      hasUnsavedChanges: true,
      families: currentState.families.map((f) =>
        f.id === familyId
          ? { ...f, guests: f.guests.filter((g) => g.id !== guestId) }
          : f,
      ),
    }));
  },

  executeDeleteFamily: async (invitationId: string, familyId: string) => {
    const state = get();
    await GuestService.deleteGuest(invitationId, familyId);

    const family = state.families.find((f) => f.id === familyId);
    if (family) {
      const guestIds = family.guests.map((g) => g.id);
      set((currentState) => ({
        elements: currentState.elements.map((el) => ({
          ...el,
          assignedSeats: el.assignedSeats.filter((s) => !guestIds.includes(s)),
        })),
        families: currentState.families.filter((f) => f.id !== familyId),
        hasUnsavedChanges: true,
      }));
    }
  },

  executeAddSeatToFamily: async (invitationId: string, familyId: string) => {
    const state = get();
    const family = state.families.find((f) => f.id === familyId);
    if (!family) return;

    const newCount = family.guests.length + 1;

    await GuestService.saveGuest(
      invitationId,
      familyId,
      {
        nombre: family.name,
        invitados: newCount,
        cambiosPermitidos: true,
      } as GuestFormData,
      false,
    );

    set((currentState) => ({
      families: currentState.families.map((f) => {
        if (f.id === familyId) {
          const nextIndex = f.guests.length;
          const newGuestId = `${familyId}_seat_${nextIndex}`;
          return {
            ...f,
            guests: [
              ...f.guests,
              { id: newGuestId, name: "", status: "pending" },
            ],
          };
        }
        return f;
      }),
    }));
  },

  setZoom: (zoom) => set({ zoom }),
  setCanvasOffset: (canvasOffset) => set({ canvasOffset }),
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  addLayoutElements: (newElements) =>
    set((state) => ({
      elements: [...state.elements, ...newElements],
      hasUnsavedChanges: true,
    })),
  selectedElementIds: [],
  setSelectedElementIds: (ids) => set({ selectedElementIds: ids }),
  removeMultipleElements: (ids) =>
    set((state) => ({
      elements: state.elements.filter((el) => !ids.includes(el.id)),
      selectedElementIds: [],
      selectedElementId:
        state.selectedElementId && ids.includes(state.selectedElementId)
          ? null
          : state.selectedElementId,
      hasUnsavedChanges: true,
    })),
}));
