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
  ".selection-box",
];

/**
 * Encapsula la selección rectangular (drag-to-select) del canvas.
 *
 * Optimizaciones de performance:
 *  - El `selectionBox` se mantiene en un `ref` + se aplica al DOM
 *    directamente (style.left/top/width/height) en `pointermove`.
 *    React no participa en el ciclo de update del box, así que
 *    mover el mouse no re-renderiza el SeatingCanvas.
 *  - El cálculo de intersección y el `setSelectedElementIds` se
 *    throttlean a 1 update por frame (requestAnimationFrame) en
 *    lugar de 1 update por cada evento `pointermove` (que puede
 *    ser > 200/seg en un mouse rápido).
 *  - El `isSelecting` también es un ref (no state) para que el
 *    toggle de visibilidad del div se haga por CSS classList en
 *    lugar de pasar por React.
 */
export function useCanvasSelectionBox(
  canvasAreaRef: React.RefObject<HTMLDivElement>,
  selectionBoxRef: React.RefObject<HTMLDivElement>,
) {
  const zoom = useZoomStore((state) => state.zoom);
  const setSelectedElementIds = useSeatingStore(
    (state) => state.setSelectedElementIds,
  );
  const setSelectedElementId = useSeatingStore(
    (state) => state.setSelectedElementId,
  );

  // Refs espejo para evitar renders en el ciclo pointermove
  const startRef = useRef({ x: 0, y: 0 });
  const selectingRef = useRef(false);

  // Frame throttle para el cálculo de intersección + update del store
  const pendingFrameRef = useRef(0);
  const lastBoxRef = useRef<SelectionBox>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  // `isSelecting` solo lo necesita el consumidor para renderizar
  // el multi-delete-popover condicionalmente. Es state porque el
  // popover SÍ debe re-renderizarse al cambiar.
  const [isSelecting, setIsSelecting] = useState(false);

  const isBackgroundEvent = useCallback((target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    for (const selector of BACKDROP_SELECTOR_EXCEPTIONS) {
      if (target.closest(selector)) return false;
    }
    return true;
  }, []);

  const applyBoxToDom = useCallback((box: SelectionBox) => {
    const el = selectionBoxRef.current;
    if (!el) return;
    el.style.left = `${box.left}px`;
    el.style.top = `${box.top}px`;
    el.style.width = `${box.width}px`;
    el.style.height = `${box.height}px`;
  }, [selectionBoxRef]);

  const showBox = useCallback(() => {
    selectionBoxRef.current?.classList.add("is-active");
  }, [selectionBoxRef]);

  const hideBox = useCallback(() => {
    selectionBoxRef.current?.classList.remove("is-active");
  }, [selectionBoxRef]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0 || !isBackgroundEvent(e.target)) return;

      const rect = canvasAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const startX = (e.clientX - rect.left) / zoom;
      const startY = (e.clientY - rect.top) / zoom;

      startRef.current = { x: startX, y: startY };
      selectingRef.current = true;

      const initialBox: SelectionBox = {
        left: startX,
        top: startY,
        width: 0,
        height: 0,
      };
      lastBoxRef.current = initialBox;
      applyBoxToDom(initialBox);
      showBox();

      setIsSelecting(true);
      setSelectedElementIds([]);
      setSelectedElementId(null);
    },
    [
      canvasAreaRef,
      zoom,
      isBackgroundEvent,
      applyBoxToDom,
      showBox,
      setSelectedElementIds,
      setSelectedElementId,
    ],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!selectingRef.current) return;

      const rect = canvasAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const currentX = (e.clientX - rect.left) / zoom;
      const currentY = (e.clientY - rect.top) / zoom;
      const { x, y } = startRef.current;

      const box: SelectionBox = {
        left: Math.min(x, currentX),
        top: Math.min(y, currentY),
        width: Math.abs(x - currentX),
        height: Math.abs(y - currentY),
      };
      lastBoxRef.current = box;
      applyBoxToDom(box);

      // Throttle: el cálculo de intersección y el update del store
      // se hacen 1 vez por frame (no 1 vez por pointermove).
      if (pendingFrameRef.current) return;
      pendingFrameRef.current = requestAnimationFrame(() => {
        pendingFrameRef.current = 0;
        const last = lastBoxRef.current;
        const elements = useSeatingStore.getState().elements as SeatingElement[];
        const intersectedIds: string[] = [];
        const boxRight = last.left + last.width;
        const boxBottom = last.top + last.height;

        for (const el of elements) {
          const elRight = el.x + el.width;
          const elBottom = el.y + el.height;
          const overlaps = !(
            el.x > boxRight ||
            elRight < last.left ||
            el.y > boxBottom ||
            elBottom < last.top
          );
          if (overlaps) intersectedIds.push(el.id);
        }
        setSelectedElementIds(intersectedIds);
      });
    },
    [canvasAreaRef, zoom, applyBoxToDom, setSelectedElementIds],
  );

  const handlePointerUp = useCallback(() => {
    selectingRef.current = false;
    if (pendingFrameRef.current) {
      cancelAnimationFrame(pendingFrameRef.current);
      pendingFrameRef.current = 0;
    }
    hideBox();
    setIsSelecting(false);
  }, [hideBox]);

  return {
    isSelecting,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
