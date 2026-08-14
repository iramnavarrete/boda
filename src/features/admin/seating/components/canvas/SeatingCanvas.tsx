"use client";

import React, { useRef, useState, useEffect } from "react";
import { useSeatingStore } from "../../stores/useSeatingStore";
import { useZoomStore } from "../../stores/useZoomStore";
import TableElement from "./TableElement";
import { ZoomIn, ZoomOut, Maximize2, Trash2 } from "lucide-react";
import { useDroppable, useDndContext } from "@dnd-kit/core";
import { ConfirmModalState } from "@/types";
import { useCanvasZoom } from "../../hooks/useCanvasZoom";
import { useCanvasSelectionBox } from "../../hooks/useCanvasSelectionBox";

interface SeatingCanvasProps {
  openConfirmModal: (config: Omit<ConfirmModalState, "isLoading">) => void;
}

export default function SeatingCanvas({
  openConfirmModal,
}: SeatingCanvasProps) {
  const elements = useSeatingStore((state) => state.elements);
  const selectedElementIds = useSeatingStore(
    (state) => state.selectedElementIds,
  );
  const setSelectedElementIds = useSeatingStore(
    (state) => state.setSelectedElementIds,
  );
  const setSelectedElementId = useSeatingStore(
    (state) => state.setSelectedElementId,
  );
  const removeMultipleElements = useSeatingStore(
    (state) => state.removeMultipleElements,
  );
  const showToast = useSeatingStore((state) => state.showToast);
  const isInitialized = useSeatingStore((state) => state.isInitialized);

  const zoom = useZoomStore((state) => state.zoom);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);

  const { active } = useDndContext();
  const isDraggingAny = Boolean(active);

  const { setNodeRef: setDroppableCanvasRef } = useDroppable({
    id: "canvas",
    data: { type: "canvas" },
  });

  const { handleZoomTarget, fitToScreen } = useCanvasZoom(containerRef);
  const {
    isSelecting,
    selectionBox,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useCanvasSelectionBox(canvasAreaRef);

  // Initial fit-to-screen cuando se inicializa el plano
  useEffect(() => {
    if (!isInitialized) return;
    fitToScreen();
    // Intencionalmente solo se ejecuta al inicializar para no interferir con el zoom manual
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

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
        className={`relative flex-1 h-full w-full overflow-auto bg-[#F9F7F2] scrollbar-thin scrollbar-thumb-[#EBE5DA] ${
          isSelecting ? "is-selecting-active" : ""
        } ${isDraggingAny ? "is-dragging-active" : ""}`}
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

        {/* CONTENEDOR FANTASMA PARA AJUSTAR BARRAS DE SCROLL EXACTAS AL ZOOM */}
        <div
          className="relative"
          style={{
            width: 4000 * zoom,
            height: 4000 * zoom,
          }}
        >
          <div
            ref={canvasAreaRef}
            className="absolute top-0 left-0 origin-top-left canvas-droppable-area"
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
      </div>
    </>
  );
}
