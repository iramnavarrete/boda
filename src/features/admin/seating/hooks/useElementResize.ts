"use client";

import { useCallback, useRef } from "react";
import { useZoomStore } from "../stores/useZoomStore";
import { useSeatingStore } from "../stores/useSeatingStore";

const MIN_SIZE = 60;
const MAX_SIZE = 1500;

interface ResizeState {
  x: number;
  y: number;
  w: number;
  h: number;
  posX: number;
  posY: number;
  corner: string;
}

/**
 * Encapsula la lógica de resize de los elementos del plano (solo áreas).
 *
 * Devuelve los handlers de pointer para los handles de resize.
 * Se separa del componente para mantener TableElement enfocado en render.
 */
export function useElementResize(elementId: string) {
  const resizeState = useRef<ResizeState | null>(null);

  const onPointerDownResize = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, corner: string) => {
      e.stopPropagation();
      e.preventDefault();

      const el = useSeatingStore
        .getState()
        .elements.find((x) => x.id === elementId);
      if (!el) return;

      resizeState.current = {
        x: e.clientX,
        y: e.clientY,
        w: el.width,
        h: el.height,
        posX: el.x,
        posY: el.y,
        corner,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [elementId],
  );

  const onPointerMoveResize = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const state = resizeState.current;
      if (!state) return;

      const currentZoom = useZoomStore.getState().zoom;
      const dx = (e.clientX - state.x) / currentZoom;
      const dy = (e.clientY - state.y) / currentZoom;
      const { w, h, posX, posY, corner } = state;

      let newW = w;
      let newH = h;
      let newX = posX;
      let newY = posY;

      if (corner.includes("left")) {
        newW = Math.max(MIN_SIZE, Math.min(MAX_SIZE, w - dx));
        newX = posX + (w - newW);
      } else if (corner.includes("right")) {
        newW = Math.max(MIN_SIZE, Math.min(MAX_SIZE, w + dx));
      }

      if (corner.includes("top")) {
        newH = Math.max(MIN_SIZE, Math.min(MAX_SIZE, h - dy));
        newY = posY + (h - newH);
      } else if (corner.includes("bottom")) {
        newH = Math.max(MIN_SIZE, Math.min(MAX_SIZE, h + dy));
      }

      useSeatingStore
        .getState()
        .updateElementGeometry(elementId, newW, newH, newX, newY);
    },
    [elementId],
  );

  const onPointerUpResize = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!resizeState.current) return;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      resizeState.current = null;
    },
    [],
  );

  return {
    onPointerDownResize,
    onPointerMoveResize,
    onPointerUpResize,
  };
}
