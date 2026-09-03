import { create } from "zustand";

interface DragState {
  /**
   * IDs de los elementos que están siendo arrastrados AHORA MISMO
   * (incluye el elemento arrastrado directamente y los de bulk).
   *
   * Solo cambia 2 veces por drag: al iniciar (true) y al terminar
   * (false). NO cambia en cada `pointermove`, por lo que el selector
   * `useIsElementDragging` re-renderiza a las cards SOLO al entrar
   * o salir del drag, nunca en cada frame.
   */
  draggingIds: Set<string>;
  setDraggingIds: (ids: Set<string>) => void;
  clearDraggingIds: () => void;
}

export const useDragStateStore = create<DragState>((set) => ({
  draggingIds: new Set(),
  setDraggingIds: (ids) => set({ draggingIds: ids }),
  clearDraggingIds: () => set({ draggingIds: new Set() }),
}));

/**
 * Re-renderiza SOLO cuando este id entra o sale del set de drag
 * (no en cada frame). El selector usa `s.draggingIds.has(id)` que
 * dnd-kit + zustand comparan por referencia del Set + el boolean
 * resultante, así que solo re-renderiza cuando ese boolean cambia
 * (true → false o false → true).
 */
export function useIsElementDragging(id: string): boolean {
  return useDragStateStore((s) => s.draggingIds.has(id));
}
