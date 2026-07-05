import { create } from "zustand";

/**
 * Store atómico exclusivo para zoom y canvas offset.
 * Separado del SeatingStore para evitar re-renders innecesarios en componentes
 * que solo necesitan zoom (como TableElement).
 */
export interface ZoomStore {
  zoom: number;
  canvasOffset: { x: number; y: number };
  setZoom: (zoom: number) => void;
  setCanvasOffset: (offset: { x: number; y: number }) => void;
}

export const useZoomStore = create<ZoomStore>((set) => ({
  zoom: 1,
  canvasOffset: { x: 0, y: 0 },
  setZoom: (zoom) => set({ zoom }),
  setCanvasOffset: (canvasOffset) => set({ canvasOffset }),
}));
