"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useSeatingStore } from "../../stores/useSeatingStore";
import { useZoomStore } from "../../stores/useZoomStore";
import TableElement from "./TableElement";
import { ZoomIn, ZoomOut, Maximize2, Trash2 } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { ConfirmModalState } from "@/types";

interface SeatingCanvasProps {
  openConfirmModal: (config: Omit<ConfirmModalState, "isLoading">) => void;
}

export default function SeatingCanvas({
  openConfirmModal,
}: SeatingCanvasProps) {
  const elements = useSeatingStore((state) => state.elements);
  const selectedElementIds = useSeatingStore((state) => state.selectedElementIds);
  const setSelectedElementIds = useSeatingStore((state) => state.setSelectedElementIds);
  const setSelectedElementId = useSeatingStore((state) => state.setSelectedElementId);
  const removeMultipleElements = useSeatingStore((state) => state.removeMultipleElements);
  const showToast = useSeatingStore((state) => state.showToast);
  const isInitialized = useSeatingStore((state) => state.isInitialized);

  const zoom = useZoomStore((state) => state.zoom);
  const setZoom = useZoomStore((state) => state.setZoom);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  const { setNodeRef: setDroppableCanvasRef } = useDroppable({
    id: "canvas",
    data: { type: "canvas" },
  });

  const handleZoomTarget = useCallback(
    (newZoom: number, mouseX?: number, mouseY?: number) => {
      const container = containerRef.current;
      if (!container) return;

      const currentZoom = useZoomStore.getState().zoom;
      if (currentZoom === newZoom) return;

      // Si no mandan coordenadas (ej. se presionaron los botones + o -), usa el centro exacto del div
      const targetX = mouseX ?? container.clientWidth / 2;
      const targetY = mouseY ?? container.clientHeight / 2;

      // 1. Calculamos la coordenada en el plano 1x gigante
      const pointX = (container.scrollLeft + targetX) / currentZoom;
      const pointY = (container.scrollTop + targetY) / currentZoom;

      // 2. Setemos el Zoom en React
      setZoom(newZoom);

      // 3. ✨ SÍNCRONO: Asignamos el scroll instantáneamente.
      // Al quitar requestAnimationFrame, la rueda vuelve a tener precisión absoluta.
      container.scrollLeft = pointX * newZoom - targetX;
      container.scrollTop = pointY * newZoom - targetY;
    },
    [setZoom],
  );

  const fitToScreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (elements.length === 0) {
      setZoom(1);
      container.scrollLeft = 2000 - container.clientWidth / 2;
      container.scrollTop = 2000 - container.clientHeight / 2;
      return;
    }

    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    elements.forEach((el) => {
      if (el.x < minX) minX = el.x;
      if (el.x + el.width > maxX) maxX = el.x + el.width;
      if (el.y < minY) minY = el.y;
      if (el.y + el.height > maxY) maxY = el.y + el.height;
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const padding = 60;

    const availableWidth = container.clientWidth - padding * 2;
    const availableHeight = container.clientHeight - padding * 2;

    let newZoom = Math.min(
      availableWidth / contentWidth,
      availableHeight / contentHeight,
    );
    newZoom = Math.min(Math.max(newZoom, 0.4), 1.8);
    setZoom(newZoom);

    setTimeout(() => {
      const contentCenterX = minX + contentWidth / 2;
      const contentCenterY = minY + contentHeight / 2;

      container.scrollLeft =
        contentCenterX * newZoom - container.clientWidth / 2;
      container.scrollTop =
        contentCenterY * newZoom - container.clientHeight / 2;
    }, 10);
  }, [elements, setZoom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();

        const currentZoom = useZoomStore.getState().zoom;
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        const newZoom = Math.min(Math.max(currentZoom * factor, 0.3), 2);

        const rect = container.getBoundingClientRect();

        // Sacamos la coordenada exacta de dónde está el puntero
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Le mandamos las coordenadas a nuestra función unificada
        handleZoomTarget(newZoom, mouseX, mouseY);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [handleZoomTarget]);

  useEffect(() => {
    if (isInitialized && elements.length > 0) {
      fitToScreen();
    } else if (containerRef.current) {
      const container = containerRef.current;
      container.scrollLeft = 2000 - container.clientWidth / 2;
      container.scrollTop = 2000 - container.clientHeight / 2;
    }
  }, [isInitialized]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;

    const isBackground =
      !target.closest(".table-element-card") &&
      !target.closest(".settings-popover") &&
      !target.closest(".zoom-controls") &&
      !target.closest(".multi-delete-popover");

    if (!isBackground || e.button !== 0) return;

    const rect = canvasAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startX = (e.clientX - rect.left) / zoom;
    const startY = (e.clientY - rect.top) / zoom;

    setIsSelecting(true);
    setSelectionStart({ x: startX, y: startY });
    setSelectionBox({ left: startX, top: startY, width: 0, height: 0 });
    setSelectedElementIds([]);
    setSelectedElementId(null);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isSelecting) return;

    const rect = canvasAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = (e.clientX - rect.left) / zoom;
    const currentY = (e.clientY - rect.top) / zoom;

    const left = Math.min(selectionStart.x, currentX);
    const top = Math.min(selectionStart.y, currentY);
    const width = Math.abs(selectionStart.x - currentX);
    const height = Math.abs(selectionStart.y - currentY);

    setSelectionBox({ left, top, width, height });

    const intersectedIds: string[] = [];
    elements.forEach((el) => {
      const elRight = el.x + el.width;
      const elBottom = el.y + el.height;
      const boxRight = left + width;
      const boxBottom = top + height;

      const overlaps = !(
        el.x > boxRight ||
        elRight < left ||
        el.y > boxBottom ||
        elBottom < top
      );

      if (overlaps) {
        intersectedIds.push(el.id);
      }
    });

    setSelectedElementIds(intersectedIds);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".multi-delete-popover")) {
      setIsSelecting(false);
      return;
    }
    setIsSelecting(false);
  };

  const handleBulkDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    openConfirmModal({
      showConfirmToast: false,
      isOpen: true,
      title: `Eliminar ${selectedElementIds.length} elementos`,
      message: `Estás por eliminar de forma permanente ${selectedElementIds.length} elementos seleccionados del plano.\n\n¿Deseas confirmar la acción?`,
      isDanger: true,
      action: async () => {
        removeMultipleElements(selectedElementIds);
        showToast("Elementos eliminados correctamente.");
      },
    });
  };

  return (
    <>
      <div className="zoom-controls absolute bottom-6 right-6 flex items-center gap-1 bg-white/95 backdrop-blur-sm p-1 rounded-full shadow-md border border-[#EBE5DA] z-40">
        <button
          onClick={() => handleZoomTarget(Math.max(zoom - 0.1, 0.3))}
          className="p-1.5 rounded-full hover:bg-[#F9F7F2] text-[#5A5A5A] cursor-pointer transition-colors"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-xs font-semibold w-12 text-center text-[#2C2C29]">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => handleZoomTarget(Math.min(zoom + 0.1, 2))}
          className="p-1.5 rounded-full hover:bg-[#F9F7F2] text-[#5A5A5A] cursor-pointer transition-colors"
        >
          <ZoomIn size={16} />
        </button>
        <div className="w-px h-4 bg-[#EBE5DA] mx-0.5" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            fitToScreen();
          }}
          className="p-1.5 rounded-full hover:bg-[#F9F7F2] text-[#5A5A5A] transition-colors cursor-pointer"
          title="Ver plano completo centrado"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 h-full w-full overflow-auto bg-[#F9F7F2] scrollbar-thin scrollbar-thumb-[#EBE5DA]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {selectedElementIds.length > 1 && (
          <div
            className="multi-delete-popover fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#FDFBF7] border border-[#EBE5DA] shadow-xl rounded-2xl p-3 flex items-center gap-4 animate-in slide-in-from-top-3 duration-200"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#2C2C29]">
                Selección múltiple
              </span>
              <span className="text-[10px] text-[#A8A29E]">
                {selectedElementIds.length} elementos seleccionados
              </span>
            </div>
            <div className="w-px h-6 bg-[#EBE5DA]" />
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              <Trash2 size={13} />
              Eliminar Selección
            </button>
          </div>
        )}

        <div
          ref={canvasAreaRef}
          className="relative origin-top-left canvas-droppable-area"
          style={{
            width: "4000px",
            height: "4000px",
            backgroundImage: `linear-gradient(#EBE5DA 1px, transparent 1px), linear-gradient(90deg, #EBE5DA 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
            transform: `scale(${zoom})`,
          }}
        >
          <div ref={setDroppableCanvasRef} className="absolute inset-0">
            {elements.map((el) => (
              <TableElement key={el.id} element={el} />
            ))}

            {isSelecting && (
              <div
                className="absolute border border-[#C5A669] bg-[#C5A669]/10 rounded pointer-events-none z-50"
                style={{
                  left: selectionBox.left,
                  top: selectionBox.top,
                  width: selectionBox.width,
                  height: selectionBox.height,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
