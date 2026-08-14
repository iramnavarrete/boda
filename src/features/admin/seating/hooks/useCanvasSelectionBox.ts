"use client";

import { useCallback, useRef, useState } from "react";
import { useSeatingStore } from "../stores/useSeatingStore";
import { useZoomStore } from "../stores/useZoomStore";
import { SeatingElement } from "@/types/seating";

export interface SelectionBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

const BACKDROP_SELECTOR_EXCEPTIONS = [
  ".table-element-card",
  ".settings-popover",
  ".zoom-controls",
  ".multi-delete-popover",
];

/**
 * Encapsula la selección rectangular (drag-to-select) del canvas.
 *
 * Centraliza la lógica que estaba acoplada en SeatingCanvas para
 * permitir reusar y mantener aislado el ciclo de vida del box.
 */
export function useCanvasSelectionBox(canvasAreaRef: React.RefObject<HTMLDivElement>) {
  const zoom = useZoomStore((state) => state.zoom);
  const setSelectedElementIds = useSeatingStore(
    (state) => state.setSelectedElementIds,
  );
  const setSelectedElementId = useSeatingStore(
    (state) => state.setSelectedElementId,
  );

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState<SelectionBox>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  // Refs espejo para evitar renders en el ciclo pointermove
  const startRef = useRef({ x: 0, y: 0 });
  const selectingRef = useRef(false);

  const isBackgroundEvent = useCallback((target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    for (const selector of BACKDROP_SELECTOR_EXCEPTIONS) {
      if (target.closest(selector)) return false;
    }
    return true;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0 || !isBackgroundEvent(e.target)) return;

      const rect = canvasAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const startX = (e.clientX - rect.left) / zoom;
      const startY = (e.clientY - rect.top) / zoom;

      startRef.current = { x: startX, y: startY };
      selectingRef.current = true;

      setIsSelecting(true);
      setSelectionStart({ x: startX, y: startY });
      setSelectionBox({ left: startX, top: startY, width: 0, height: 0 });
      setSelectedElementIds([]);
      setSelectedElementId(null);
    },
    [canvasAreaRef, zoom, isBackgroundEvent, setSelectedElementIds, setSelectedElementId],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!selectingRef.current) return;

      const rect = canvasAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const currentX = (e.clientX - rect.left) / zoom;
      const currentY = (e.clientY - rect.top) / zoom;
      const { x, y } = startRef.current;

      const left = Math.min(x, currentX);
      const top = Math.min(y, currentY);
      const width = Math.abs(x - currentX);
      const height = Math.abs(y - currentY);

      setSelectionBox({ left, top, width, height });

      const elements = useSeatingStore.getState().elements as SeatingElement[];
      const intersectedIds: string[] = [];
      const boxRight = left + width;
      const boxBottom = top + height;

      for (const el of elements) {
        const elRight = el.x + el.width;
        const elBottom = el.y + el.height;
        const overlaps = !(
          el.x > boxRight ||
          elRight < left ||
          el.y > boxBottom ||
          elBottom < top
        );
        if (overlaps) intersectedIds.push(el.id);
      }

      setSelectedElementIds(intersectedIds);
    },
    [canvasAreaRef, zoom, setSelectedElementIds],
  );

  const handlePointerUp = useCallback(() => {
    selectingRef.current = false;
    setIsSelecting(false);
  }, []);

  return {
    isSelecting,
    selectionBox,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
