import { GuestService } from "@/services/guestService";
import { GuestFormData, GuestSeat } from "@/types";
import { create } from "zustand";
import { SeatingService } from "../services/seatingService";
import { removeHighlightSeats } from "../utils/highlightHelper";

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

export interface Family {
  id: string;
  name: string;
  deadline: string | null;
  aliases: string[];
  colorBg: string;
  colorBorder: string;
  guests: GuestSeat[];
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
  selectedElementIds: string[];
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
        // Limpia el invitado de donde estuviera antes (deja un hueco "")
        const newSeats = el.assignedSeats.map((s) => (s === guestId ? "" : s));

        if (el.id === tableId) {
          const emptyIndex = newSeats.findIndex((s) => !s || s === "");
          if (emptyIndex !== -1 && emptyIndex < el.seats) {
            newSeats[emptyIndex] = guestId;
          } else if (newSeats.length < el.seats) {
            newSeats.push(guestId);
          }
        }
        return { ...el, assignedSeats: newSeats };
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
        assignedSeats: el.assignedSeats.map((s) =>
          guestIds.includes(s) ? "" : s,
        ),
      }));

      nextState = nextState.map((el) => {
        if (el.id === tableId) {
          const newSeats = [...el.assignedSeats];
          const guestsToAssign = [...guestIds];

          for (let i = 0; i < el.seats; i++) {
            if (
              (!newSeats[i] || newSeats[i] === "") &&
              guestsToAssign.length > 0
            ) {
              newSeats[i] = guestsToAssign.shift() as string;
            }
          }
          return { ...el, assignedSeats: newSeats };
        }
        return el;
      });
      return { elements: nextState, hasUnsavedChanges: true };
    }),

  removeGuestFromTable: (tableId, guestId) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === tableId
          ? {
              ...el,
              // Deja un hueco "" para no alterar el orden de los demás
              assignedSeats: el.assignedSeats.map((s) =>
                s === guestId ? "" : s,
              ),
            }
          : el,
      ),
      hasUnsavedChanges: true,
    }));
    removeHighlightSeats("guest", guestId);
  },
  removeFamilyFromTable: (familyId) => {
    set((state) => {
      const family = state.families.find((f) => f.id === familyId);
      if (!family) return state;
      const guestIds = family.guests.map((g) => g.id);
      return {
        elements: state.elements.map((el) => ({
          ...el,
          assignedSeats: el.assignedSeats.map((s) =>
            guestIds.includes(s) ? "" : s,
          ),
        })),
        hasUnsavedChanges: true,
      };
    });
    removeHighlightSeats("family", familyId);
  },
  updateGuestName: (familyId, guestId, name) =>
    set((state) => ({
      hasUnsavedChanges: true,
      families: state.families.map((f) => {
        if (f.id === familyId) {
          return {
            ...f,
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
    const family = state.families.find((f) => f.id === familyId);
    if (!family) return;

    const updatedGuests = family.guests.filter((g) => g.id !== guestId);

    const newElements = state.elements.map((el) => ({
      ...el,
      assignedSeats: el.assignedSeats.map((seatId) =>
        seatId === guestId ? "" : seatId,
      ),
    }));

    try {
      await GuestService.removeGuestSeatAndReduceCount(
        invitationId,
        familyId,
        updatedGuests,
      );
      await SeatingService.savePlan(invitationId, newElements);

      set((currentState) => ({
        hasUnsavedChanges: true,
        elements: newElements,
        families: currentState.families.map((f) =>
          f.id === familyId ? { ...f, guests: updatedGuests } : f,
        ),
      }));
    } catch (error) {
      console.error(error);
      get().showToast("Error al sincronizar asiento eliminado.");
    }
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

    const newGuestId = crypto.randomUUID();
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
          return {
            ...f,
            guests: [
              ...f.guests,
              { id: newGuestId, nombre: "", estatus: "pending" },
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
