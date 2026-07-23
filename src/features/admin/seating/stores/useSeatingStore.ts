import { FamiliesService } from "@/services/familiesService";
import { Family, GuestSeat } from "@/types";
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

export interface FamilyElement {
  id: string;
  name: string;
  deadline: string | null;
  colorBg: string;
  colorBorder: string;
  guests: GuestSeat[];
  allowChanges: boolean;
  rawFamily: Family;
}

export interface UnassignOptions {
  includeNoDeadline: boolean;
  includePendingNotExpired: boolean;
  includePendingExpired: boolean;
}

export interface SeatingStore {
  elements: SeatingElement[];
  families: FamilyElement[];
  selectedElementId: string | null;
  selectedElementIds: string[];
  toastMsg: string | null;
  isInitialized: boolean;
  hasUnsavedChanges: boolean;

  initialize: (
    dbElements: SeatingElement[],
    dbFamilies: FamilyElement[],
  ) => void;
  updateFamilies: (families: FamilyElement[]) => void;
  markSaved: () => void;
  addElement: (
    element: Omit<SeatingElement, "assignedSeats" | "alias">,
    alias: string,
  ) => void;
  removeElement: (id: string) => void;
  updateElementPosition: (id: string, x: number, y: number) => void;
  updateMultipleElementPositions: (
    ids: string[],
    dx: number,
    dy: number,
  ) => void;
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

  unassignByCriteria: (options: UnassignOptions) => void;

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

  setSelectedElementId: (id: string | null) => void;
  setSelectedElementIds: (ids: string[]) => void;
  showToast: (msg: string) => void;
  addLayoutElements: (newElements: SeatingElement[]) => void;
  removeMultipleElements: (ids: string[]) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER DE AGRUPACIÓN INTELIGENTE
// ─────────────────────────────────────────────────────────────────────────────

const groupSeatsByFamily = (
  seats: string[],
  families: FamilyElement[],
): string[] => {
  const filled = seats.filter((s) => {
    if (!s || s === "") return false;
    return families.some((f) => f.guests.some((g) => g.id === s));
  });

  const familyOrder: string[] = [];
  const guestsByFamily: Record<string, string[]> = {};

  filled.forEach((guestId) => {
    const family = families.find((f) => f.guests.some((g) => g.id === guestId));
    if (!family) return;

    const famId = family.id;
    if (!guestsByFamily[famId]) {
      guestsByFamily[famId] = [];
      familyOrder.push(famId);
    }
    guestsByFamily[famId].push(guestId);
  });

  const result: string[] = [];
  familyOrder.forEach((famId) => {
    result.push(...guestsByFamily[famId]);
  });

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────

let toastTimeout: ReturnType<typeof setTimeout>;

export const useSeatingStore = create<SeatingStore>((set, get) => ({
  elements: [],
  families: [],
  selectedElementId: null,
  selectedElementIds: [],
  toastMsg: null,
  isInitialized: false,
  hasUnsavedChanges: false,

  initialize: (dbElements, dbFamilies) => {
    const cleanedElements = dbElements.map((el) => ({
      ...el,
      assignedSeats: groupSeatsByFamily(el.assignedSeats, dbFamilies),
    }));

    set({
      elements: cleanedElements,
      families: dbFamilies,
      isInitialized: true,
      hasUnsavedChanges: false,
    });
  },

  updateFamilies: (newFamilies) =>
    set((state) => {
      const cleanedElements = state.elements.map((el) => ({
        ...el,
        assignedSeats: groupSeatsByFamily(el.assignedSeats, newFamilies),
      }));

      const elementsChanged =
        JSON.stringify(state.elements) !== JSON.stringify(cleanedElements);

      return {
        families: newFamilies,
        elements: cleanedElements,
        hasUnsavedChanges: state.hasUnsavedChanges || elementsChanged,
      };
    }),

  markSaved: () =>
    set({
      hasUnsavedChanges: false,
    }),

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

  updateMultipleElementPositions: (ids, dx, dy) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        ids.includes(el.id) ? { ...el, x: el.x + dx, y: el.y + dy } : el,
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
        el.id === id
          ? {
              ...el,
              seats,
              assignedSeats: groupSeatsByFamily(
                el.assignedSeats,
                state.families,
              ),
            }
          : el,
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
    set((state) => {
      return {
        elements: state.elements.map((el) => {
          const newSeats = el.assignedSeats.filter(
            (s) => s && s !== "" && s !== guestId,
          );

          if (el.id === tableId) {
            newSeats.push(guestId);
          }

          return {
            ...el,
            assignedSeats: groupSeatsByFamily(newSeats, state.families),
          };
        }),
        hasUnsavedChanges: true,
      };
    }),

  assignFamilyToTable: (tableId, familyId) =>
    set((state) => {
      const family = state.families.find((f) => f.id === familyId);
      if (!family) return state;
      const guestIds = family.guests.map((g) => g.id);

      return {
        elements: state.elements.map((el) => {
          const newSeats = el.assignedSeats.filter(
            (s) => s && s !== "" && !guestIds.includes(s),
          );

          if (el.id === tableId) {
            const availableSpace = el.seats - newSeats.length;
            const guestsToAdd = guestIds.slice(0, availableSpace);
            newSeats.push(...guestsToAdd);
          }

          return {
            ...el,
            assignedSeats: groupSeatsByFamily(newSeats, state.families),
          };
        }),
        hasUnsavedChanges: true,
      };
    }),

  removeGuestFromTable: (tableId, guestId) => {
    set((state) => ({
      elements: state.elements.map((el) => {
        if (el.id !== tableId) return el;
        const newSeats = el.assignedSeats.filter(
          (s) => s && s !== "" && s !== guestId,
        );
        return {
          ...el,
          assignedSeats: groupSeatsByFamily(newSeats, state.families),
        };
      }),
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
          assignedSeats: groupSeatsByFamily(
            el.assignedSeats.filter(
              (s) => s && s !== "" && !guestIds.includes(s),
            ),
            state.families,
          ),
        })),
        hasUnsavedChanges: true,
      };
    });
    removeHighlightSeats("family", familyId);
  },

  unassignByCriteria: (options: UnassignOptions) => {
    const { elements, families, showToast } = get();
    const guestIdsToRemove = new Set<string>();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    families.forEach((family) => {
      const hasDeadline = !!family.deadline;
      let deadlineDate: Date | null = null;

      if (hasDeadline) {
        deadlineDate = new Date(family.deadline!);
        deadlineDate.setHours(23, 59, 59, 999);
      }

      const isExpired = deadlineDate ? deadlineDate < now : false;

      family.guests.forEach((guest) => {
        const status = (guest.estatus || "pending").toLowerCase();

        if (
          status !== "declinado" &&
          status !== "rechazado" &&
          status !== "declined"
        )
          return;

        if (!hasDeadline && options.includeNoDeadline)
          guestIdsToRemove.add(guest.id);
        else if (hasDeadline && !isExpired && options.includePendingNotExpired)
          guestIdsToRemove.add(guest.id);
        else if (hasDeadline && isExpired && options.includePendingExpired)
          guestIdsToRemove.add(guest.id);
      });
    });

    if (guestIdsToRemove.size === 0) {
      showToast(
        "No hay invitados declinados que coincidan con esos criterios.",
      );
      return;
    }

    let removedCount = 0;

    const updatedElements = elements.map((el) => {
      if (!el.assignedSeats?.length) return el;

      const newSeats = el.assignedSeats.filter(
        (id) => !guestIdsToRemove.has(id),
      );

      removedCount += el.assignedSeats.length - newSeats.length;

      return {
        ...el,
        assignedSeats: groupSeatsByFamily(newSeats, families),
      };
    });

    if (removedCount === 0) {
      showToast(
        "Los invitados declinados encontrados ya estaban fuera de las mesas.",
      );
      return;
    }

    set({
      elements: updatedElements,
      hasUnsavedChanges: true,
    });

    const s = removedCount === 1 ? "" : "s";
    showToast(
      `${removedCount} asiento${s} declinado${s} liberado${s} exitosamente.`,
    );
  },

  executeRemoveSeat: async (invitationId, familyId, guestId) => {
    const state = get();
    const family = state.families.find((f) => f.id === familyId);
    if (!family) return;

    const updatedGuests = family.guests.filter((g) => g.id !== guestId);
    const updatedFamilies = state.families.map((f) =>
      f.id === familyId ? { ...f, guests: updatedGuests } : f,
    );

    const newElements = state.elements.map((el) => ({
      ...el,
      assignedSeats: groupSeatsByFamily(
        el.assignedSeats.filter((s) => s && s !== "" && s !== guestId),
        updatedFamilies,
      ),
    }));

    try {
      await FamiliesService.removeFamilySeatAndReduceCount(
        invitationId,
        family.rawFamily,
        updatedGuests,
      );
      await SeatingService.savePlan(invitationId, newElements);

      set(() => ({
        hasUnsavedChanges: false,
        elements: newElements,
        families: updatedFamilies,
      }));
    } catch (error) {
      console.error(error);
      get().showToast("Error al sincronizar asiento eliminado.");
    }
  },

  executeDeleteFamily: async (invitationId: string, familyId: string) => {
    const state = get();
    await FamiliesService.deleteFamily(invitationId, familyId);

    const family = state.families.find((f) => f.id === familyId);
    if (family) {
      const guestIds = family.guests.map((g) => g.id);
      set((currentState) => ({
        elements: currentState.elements.map((el) => ({
          ...el,
          assignedSeats: groupSeatsByFamily(
            el.assignedSeats.filter(
              (s) => s && s !== "" && !guestIds.includes(s),
            ),
            currentState.families,
          ),
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

    await FamiliesService.saveFamily(
      invitationId,
      family.rawFamily,
      {
        ...family.rawFamily,
        invitados: newCount,
        cambiosPermitidos: true,
      },
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

  setSelectedElementId: (id) => set({ selectedElementId: id }),
  setSelectedElementIds: (ids) => set({ selectedElementIds: ids }),

  addLayoutElements: (newElements) =>
    set((state) => ({
      elements: [...state.elements, ...newElements],
      hasUnsavedChanges: true,
    })),

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
