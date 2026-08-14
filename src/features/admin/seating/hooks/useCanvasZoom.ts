"use client";

import { useCallback, useEffect } from "react";
import { useZoomStore } from "../stores/useZoomStore";
import { useSeatingStore } from "../stores/useSeatingStore";
import { SeatingElement } from "@/types/seating";

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2;
const FIT_MIN = 0.4;
const FIT_MAX = 1.8;
const FIT_PADDING = 60;
const CENTER_FALLBACK = 2000;

/**
 * Encapsula zoom (botones, fit-to-screen y Ctrl+Wheel).
 * Mantiene SeatingCanvas enfocado en layout.
 */
export function useCanvasZoom(containerRef: React.RefObject<HTMLDivElement>) {
  const setZoom = useZoomStore((state) => state.setZoom);

  const handleZoomTarget = useCallback(
    (newZoom: number, mouseX?: number, mouseY?: number) => {
      const container = containerRef.current;
      if (!container) return;

      const currentZoom = useZoomStore.getState().zoom;
      if (currentZoom === newZoom) return;

      const targetX = mouseX ?? container.clientWidth / 2;
      const targetY = mouseY ?? container.clientHeight / 2;

      const pointX = (container.scrollLeft + targetX) / currentZoom;
      const pointY = (container.scrollTop + targetY) / currentZoom;

      setZoom(newZoom);

      container.scrollLeft = pointX * newZoom - targetX;
      container.scrollTop = pointY * newZoom - targetY;
    },
    [containerRef, setZoom],
  );

  const fitToScreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = useSeatingStore.getState().elements as SeatingElement[];

    if (elements.length === 0) {
      setZoom(1);
      container.scrollLeft = CENTER_FALLBACK - container.clientWidth / 2;
      container.scrollTop = CENTER_FALLBACK - container.clientHeight / 2;
      return;
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const el of elements) {
      if (el.x < minX) minX = el.x;
      if (el.x + el.width > maxX) maxX = el.x + el.width;
      if (el.y < minY) minY = el.y;
      if (el.y + el.height > maxY) maxY = el.y + el.height;
    }

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const availableWidth = container.clientWidth - FIT_PADDING * 2;
    const availableHeight = container.clientHeight - FIT_PADDING * 2;

    let newZoom = Math.min(
      availableWidth / contentWidth,
      availableHeight / contentHeight,
    );
    newZoom = Math.min(Math.max(newZoom, FIT_MIN), FIT_MAX);
    setZoom(newZoom);

    setTimeout(() => {
      const contentCenterX = minX + contentWidth / 2;
      const contentCenterY = minY + contentHeight / 2;
      container.scrollLeft =
        contentCenterX * newZoom - container.clientWidth / 2;
      container.scrollTop =
        contentCenterY * newZoom - container.clientHeight / 2;
    }, 10);
  }, [containerRef, setZoom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();

      const currentZoom = useZoomStore.getState().zoom;
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      const newZoom = Math.min(
        Math.max(currentZoom * factor, MIN_ZOOM),
        MAX_ZOOM,
      );

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      handleZoomTarget(newZoom, mouseX, mouseY);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [containerRef, handleZoomTarget]);

  return { handleZoomTarget, fitToScreen };
}
