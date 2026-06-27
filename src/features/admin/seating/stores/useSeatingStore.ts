import { FamiliesService } from "@/services/familiesService";
import { FamilyFormData, GuestSeat } from "@/types";
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
  aliases: string[];
  colorBg: string;
  colorBorder: string;
  guests: GuestSeat[];
  hasUnsavedChanges?: boolean;
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

  setSelectedElementId: (id: string | null) => void;
  setSelectedElementIds: (ids: string[]) => void;
  showToast: (msg: string) => void;
  addLayoutElements: (newElements: SeatingElement[]) => void;
  removeMultipleElements: (ids: string[]) => void;
}

export const generateFamilyColors = (
  families: Omit<FamilyElement, "colorBg" | "colorBorder">[],
): FamilyElement[] => {
  return families.map((fam, i) => {
    const hue = Math.floor((i * (360 / families.length)) % 360);
    return {
      ...fam,
      colorBg: `hsl(${hue}, 80%, 85%)`,
      colorBorder: `hsl(${hue}, 70%, 65%)`,
    };
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 🔥 HELPER DE AGRUPACIÓN INTELIGENTE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reordena los asientos de una mesa agrupándolos automáticamente por familia,
 * manteniendo el orden de llegada de las familias a la mesa.
 * También compacta automáticamente eliminando los huecos.
 */
const groupSeatsByFamily = (
  seats: string[],
  families: FamilyElement[],
  maxSeats: number,
): string[] => {
  // 1. Nos quedamos solo con los invitados reales que están en esta mesa
  const filled = seats.filter((s) => s && s !== "");

  const familyOrder: string[] = [];
  const guestsByFamily: Record<string, string[]> = {};

  // 2. Mapeamos a qué familia pertenece cada invitado
  filled.forEach((guestId) => {
    const family = families.find((f) => f.guests.some((g) => g.id === guestId));
    const famId = family ? family.id : "independent";

    if (!guestsByFamily[famId]) {
      guestsByFamily[famId] = [];
      familyOrder.push(famId);
    }
    guestsByFamily[famId].push(guestId);
  });

  // 3. Reconstruimos el arreglo fusionando a los miembros por familia
  const result: string[] = [];
  familyOrder.forEach((famId) => {
    result.push(...guestsByFamily[famId]);
  });

  // 4. Rellenamos el resto de la mesa con espacios vacíos
  while (result.length < maxSeats) {
    result.push("");
  }

  return result.slice(0, maxSeats);
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
                seats,
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

  // 🔥 CORRECCIÓN: Filtramos los strings vacíos antes de contar o empujar a la mesa
  assignGuestToTable: (tableId, guestId) =>
    set((state) => {
      return {
        elements: state.elements.map((el) => {
          // Filtramos huecos ("") y al mismo tiempo sacamos al invitado si ya estaba en otra mesa
          const newSeats = el.assignedSeats.filter(
            (s) => s && s !== "" && s !== guestId,
          );

          if (el.id === tableId) {
            newSeats.push(guestId);
          }

          return {
            ...el,
            assignedSeats: groupSeatsByFamily(
              newSeats,
              state.families,
              el.seats,
            ),
          };
        }),
        hasUnsavedChanges: true,
      };
    }),

  // 🔥 CORRECCIÓN: Filtramos los strings vacíos para calcular bien el espacio real (availableSpace)
  assignFamilyToTable: (tableId, familyId) =>
    set((state) => {
      const family = state.families.find((f) => f.id === familyId);
      if (!family) return state;
      const guestIds = family.guests.map((g) => g.id);

      return {
        elements: state.elements.map((el) => {
          // Filtramos espacios vacíos y sacamos a toda la familia de las mesas donde estuvieran
          const newSeats = el.assignedSeats.filter(
            (s) => s && s !== "" && !guestIds.includes(s),
          );

          if (el.id === tableId) {
            // Al no tener huecos estorbando, esta resta sí da el tamaño real libre de la mesa
            const availableSpace = el.seats - newSeats.length;
            const guestsToAdd = guestIds.slice(0, availableSpace);
            newSeats.push(...guestsToAdd);
          }

          return {
            ...el,
            assignedSeats: groupSeatsByFamily(
              newSeats,
              state.families,
              el.seats,
            ),
          };
        }),
        hasUnsavedChanges: true,
      };
    }),

  removeGuestFromTable: (tableId, guestId) => {
    set((state) => ({
      elements: state.elements.map((el) => {
        if (el.id !== tableId) return el;
        // Purgamos huecos antes de re-agrupar
        const newSeats = el.assignedSeats.filter(
          (s) => s && s !== "" && s !== guestId,
        );
        return {
          ...el,
          assignedSeats: groupSeatsByFamily(newSeats, state.families, el.seats),
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
            el.seats,
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
      assignedSeats: groupSeatsByFamily(
        el.assignedSeats.filter(
          (seatId) => seatId && seatId !== "" && seatId !== guestId,
        ),
        state.families,
        el.seats,
      ),
    }));

    try {
      await FamiliesService.removeFamilySeatAndReduceCount(
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
            el.seats,
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
      familyId,
      {
        nombre: family.name,
        invitados: newCount,
        cambiosPermitidos: true,
      } as FamilyFormData,
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
