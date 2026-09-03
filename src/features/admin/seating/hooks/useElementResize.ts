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
 * Encapsula la lógica de resize de los elementos del plano.
 *
 * Opciones:
 *  - `lockAxis: "x" | "y"` → bloquea resize en uno de los ejes
 *    (ej. muro: solo ancho)
 *  - `lockAspectRatio: true` → fuerza que width === height al
 *    redimensionar (ej. mesas cuadradas y circulares)
 */
export function useElementResize(
  elementId: string,
  options?: { lockAxis?: "x" | "y"; lockAspectRatio?: boolean },
) {
  const { lockAxis, lockAspectRatio } = options ?? {};
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

      // ─── Lock aspect ratio (1:1) ─────────────────────────────
      // Para mesas cuadradas/circulares: el delta aplicado es
      // el mayor entre horizontal y vertical, manteniendo el cuadrado.
      let effectiveDx = dx;
      let effectiveDy = dy;
      if (lockAspectRatio) {
        const dominant = Math.max(Math.abs(dx), Math.abs(dy));
        effectiveDx = Math.sign(dx) * dominant;
        effectiveDy = Math.sign(dy) * dominant;
      }

      // Resize horizontal
      if (lockAxis !== "y") {
        if (corner.includes("left")) {
          newW = Math.max(MIN_SIZE, Math.min(MAX_SIZE, w - effectiveDx));
          newX = posX + (w - newW);
        } else if (corner.includes("right")) {
          newW = Math.max(MIN_SIZE, Math.min(MAX_SIZE, w + effectiveDx));
        }
      }

      // Resize vertical
      if (lockAxis !== "x") {
        if (corner.includes("top")) {
          newH = Math.max(MIN_SIZE, Math.min(MAX_SIZE, h - effectiveDy));
          newY = posY + (h - newH);
        } else if (corner.includes("bottom")) {
          newH = Math.max(MIN_SIZE, Math.min(MAX_SIZE, h + effectiveDy));
        }
      }

      // Si está bloqueado el aspect ratio, forzar width = height
      if (lockAspectRatio) {
        const maxSize = Math.max(newW, newH);
        const dW = maxSize - newW;
        const dH = maxSize - newH;
        // Ajustar según el corner para mantener el lado que se arrastra
        if (corner.includes("left")) {
          newX = posX + dW; // el lado izquierdo se mueve con el resize
        }
        if (corner.includes("top")) {
          newY = posY + dH;
        }
        newW = maxSize;
        newH = maxSize;
      }

      useSeatingStore
        .getState()
        .updateElementGeometry(elementId, newW, newH, newX, newY);
    },
    [elementId, lockAxis, lockAspectRatio],
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
