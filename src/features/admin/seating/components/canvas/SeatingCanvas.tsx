"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { useSeatingStore } from "../../stores/useSeatingStore";
import { useZoomStore } from "../../stores/useZoomStore";
import TableElement from "./TableElement";
import { ZoomIn, ZoomOut, Maximize2, Trash2 } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { ConfirmModalState } from "@/types";
import { useCanvasZoom } from "../../hooks/useCanvasZoom";
import { useCanvasSelectionBox } from "../../hooks/useCanvasSelectionBox";
import { DraggingClassApplier } from "../../hooks/useDraggingClassApplier";
import { getElementLayer } from "@/types/seating";

interface SeatingCanvasProps {
  openConfirmModal: (config: Omit<ConfirmModalState, "isLoading">) => void;
}

/**
 * Tamaño mínimo del canvas cuando el plano está vacío. Da espacio
 * inicial para arrastrar las primeras mesas sin chocar con el borde.
 */
const CANVAS_MIN_SIZE = 2000;

/**
 * Padding extra que se agrega al bounding box de los elementos
 * para tener espacio de "arrastre libre" cerca del borde.
 */
const CANVAS_PADDING = 1000;

export default function SeatingCanvas({
  openConfirmModal,
}: SeatingCanvasProps) {
  const elements = useSeatingStore((state) => state.elements);
  const selectedElementIds = useSeatingStore(
    (state) => state.selectedElementIds,
  );
  const removeMultipleElements = useSeatingStore(
    (state) => state.removeMultipleElements,
  );
  const showToast = useSeatingStore((state) => state.showToast);
  const isInitialized = useSeatingStore((state) => state.isInitialized);

  const zoom = useZoomStore((state) => state.zoom);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  // Ref al div del selection box: el hook actualiza su style
  // directamente (sin pasar por React) durante pointermove.
  const selectionBoxDivRef = useRef<HTMLDivElement>(null);

  // Ordena los elementos por layer para que los estructurales siempre
  // queden al fondo del DOM (y por lo tanto detrás de mesas/áreas).
  // Orden de layer: structural → utility → service → furniture → area → table
  const sortedElements = useMemo(() => {
    const order: Record<string, number> = {
      structural: 0,
      utility: 1,
      service: 2,
      furniture: 3,
      area: 4,
      table: 5,
    };
    return [...elements].sort((a, b) => {
      const la = order[getElementLayer(a.type)] ?? 99;
      const lb = order[getElementLayer(b.type)] ?? 99;
      return la - lb;
    });
  }, [elements]);

  /**
   * Tamaño dinámico del canvas basado en el bounding box de los
   * elementos + padding. Plano vacío → CANVAS_MIN_SIZE. Con
   * elementos → max(boundingBox + padding, CANVAS_MIN_SIZE).
   *
   * Esto reduce drásticamente la VRAM y los píxeles backing del
   * gradiente en planos típicos (vacíos o con pocas mesas),
   * pasando de 16M píxeles (4000×4000 fijo) a ~4M píxeles o menos.
   */
  const canvasSize = useMemo(() => {
    if (elements.length === 0) {
      return { width: CANVAS_MIN_SIZE, height: CANVAS_MIN_SIZE };
    }

    let maxX = 0;
    let maxY = 0;
    for (const el of elements) {
      if (el.x + el.width > maxX) maxX = el.x + el.width;
      if (el.y + el.height > maxY) maxY = el.y + el.height;
    }

    return {
      width: Math.max(CANVAS_MIN_SIZE, maxX + CANVAS_PADDING),
      height: Math.max(CANVAS_MIN_SIZE, maxY + CANVAS_PADDING),
    };
  }, [elements]);

  const { setNodeRef: setDroppableCanvasRef } = useDroppable({
    id: "canvas",
    data: { type: "canvas" },
  });

  const { handleZoomTarget, fitToScreen } = useCanvasZoom(containerRef);
  const {
    isSelecting,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useCanvasSelectionBox(canvasAreaRef, selectionBoxDivRef);

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
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Sincroniza `is-dragging-active` en el containerRef vía
            useDndMonitor (sin causar re-render de SeatingCanvas). */}
        <DraggingClassApplier containerRef={containerRef} />
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
            width: canvasSize.width * zoom,
            height: canvasSize.height * zoom,
          }}
        >
          <div
            ref={canvasAreaRef}
            className="absolute top-0 left-0 origin-top-left canvas-droppable-area"
            style={{
              width: `${canvasSize.width}px`,
              height: `${canvasSize.height}px`,
              backgroundImage: `linear-gradient(#EBE5DA 1px, transparent 1px), linear-gradient(90deg, #EBE5DA 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
              transform: `scale(${zoom})`,
            }}
          >
            <div ref={setDroppableCanvasRef} className="absolute inset-0">
              {sortedElements.map((el) => (
                <TableElement key={el.id} element={el} />
              ))}

              {/* Selection box: se renderiza SIEMPRE; el hook
                  actualiza su `style.left/top/width/height` directamente
                  y la clase `is-active` controla la visibilidad. */}
              <div
                ref={selectionBoxDivRef}
                className="selection-box absolute border border-[#C5A669] bg-[#C5A669]/10 rounded pointer-events-none z-50"
                style={{ left: 0, top: 0, width: 0, height: 0 }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
