"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useSeatingStore } from "../../stores/useSeatingStore";
import TableElement from "./TableElement";
import { ZoomIn, ZoomOut, Maximize2, Trash2 } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { ConfirmModalState } from "@/types";
interface SeatingCanvasProps {
  openConfirmModal: (config: Omit<ConfirmModalState, "isLoading">) => void;
}

export default function SeatingCanvas({ openConfirmModal }: SeatingCanvasProps) {
  const {
    elements,
    zoom,
    setZoom,
    selectedElementIds,
    setSelectedElementIds,
    setSelectedElementId,
    removeMultipleElements,
    showToast,
    isInitialized,
  } = useSeatingStore();

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

  // Centra dinámicamente todo el plano basándose en el bounding box de las mesas
  const fitToScreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (elements.length === 0) {
      setZoom(1);
      container.scrollLeft = 2000 - container.clientWidth / 2;
      container.scrollTop = 2000 - container.clientHeight / 2;
      return;
    }

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

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

    let newZoom = Math.min(availableWidth / contentWidth, availableHeight / contentHeight);
    newZoom = Math.min(Math.max(newZoom, 0.4), 1.8);
    setZoom(newZoom);

    setTimeout(() => {
      const contentCenterX = minX + contentWidth / 2;
      const contentCenterY = minY + contentHeight / 2;

      container.scrollLeft = contentCenterX * newZoom - container.clientWidth / 2;
      container.scrollTop = contentCenterY * newZoom - container.clientHeight / 2;
    }, 10);
  }, [elements, setZoom]);

  // Zoom matemático de precisión apuntando exactamente hacia el puntero del mouse
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();

        const currentZoom = useSeatingStore.getState().zoom;
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        const newZoom = Math.min(Math.max(currentZoom * factor, 0.3), 2);

        if (newZoom === currentZoom) return;

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const canvasMouseX = (container.scrollLeft + mouseX) / currentZoom;
        const canvasMouseY = (container.scrollTop + mouseY) / currentZoom;

        setZoom(newZoom);

        container.scrollLeft = canvasMouseX * newZoom - mouseX;
        container.scrollTop = canvasMouseY * newZoom - mouseY;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [setZoom]);

  // Centrado inicial de resguardo
  useEffect(() => {
    if (isInitialized && elements.length > 0) {
      fitToScreen();
    } else if (containerRef.current) {
      const container = containerRef.current;
      container.scrollLeft = 2000 - container.clientWidth / 2;
      container.scrollTop = 2000 - container.clientHeight / 2;
    }
  }, [isInitialized]);

  // INICIO DEL ARRASTRE DE SELECCIÓN
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

  // DIBUJANDO EL CUADRO
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

  // 🔥 Ejecución del Popover múltiple inyectando la acción nativa en el prop recibido
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

  const gridSize = 20 * zoom;

  return (
    <>
      {/* CONTROLES DE ZOOM EN LA ESQUINA INFERIOR DERECHA */}
      <div className="zoom-controls absolute bottom-6 right-6 flex items-center gap-1 bg-white/95 backdrop-blur-sm p-1 rounded-full shadow-md border border-[#EBE5DA] z-40">
        <button
          onClick={() => setZoom(Math.max(zoom - 0.1, 0.3))}
          className="p-1.5 rounded-full hover:bg-[#F9F7F2] text-[#5A5A5A] cursor-pointer"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-xs font-semibold w-12 text-center text-[#2C2C29]">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
          className="p-1.5 rounded-full hover:bg-[#F9F7F2] text-[#5A5A5A] cursor-pointer"
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
        {/* POPOVER DE ELIMINACIÓN MASIVA */}
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

        {/* LIENZO INTERNO DE TRABAJO (4000px por 4000px) */}
        <div
          ref={canvasAreaRef}
          className="relative origin-top-left canvas-droppable-area"
          style={{
            width: "4000px",
            height: "4000px",
            backgroundImage: `linear-gradient(#EBE5DA 1px, transparent 1px), linear-gradient(90deg, #EBE5DA 1px, transparent 1px)`,
            backgroundSize: `${gridSize}px ${gridSize}px`,
            transform: `scale(${zoom})`,
          }}
        >
          <div ref={setDroppableCanvasRef} className="absolute inset-0">
            {elements.map((el) => (
              <TableElement key={el.id} element={el} />
            ))}

            {/* CUADRO VISUAL DE LA SELECCIÓN */}
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