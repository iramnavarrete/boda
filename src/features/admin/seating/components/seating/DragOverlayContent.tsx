import React from "react";
import { GripVertical, Sparkles } from "lucide-react";
import { DragItemData, SeatingElement } from "@/types/seating";
import { useZoomStore } from "../../stores/useZoomStore";
import { ElementShape } from "../canvas/ElementShape";

/**
 * Contenido del overlay de arrastre.
 *
 * El **centrado en el cursor** se hace en el componente padre
 * (`CursorCenteredDragOverlay`) vía `transform: translate(-50%, -50%)`
 * en el root del portal, no aquí. Esto garantiza que el centro del
 * overlay quede exactamente bajo el cursor sin importar el tamaño
 * del elemento fuente (resuelve el desajuste visual entre el item
 * angosto del sidebar y el overlay ancho de una mesa).
 *
 * Si el padre cambia y vuelve a usar el `DragOverlay` de dnd-kit
 * (que preserva el punto de agarre), habría que volver a aplicar
 * el `translate(-50%, -50%)` en los wrappers internos.
 */
interface DragOverlayContentProps {
  activeDragItem: {
    type?: string;
    data: DragItemData | null;
  } | null;
}

export function DragOverlayContent({
  activeDragItem,
}: DragOverlayContentProps) {
  const { zoom } = useZoomStore();

  if (!activeDragItem?.data) return null;

  const dragData = activeDragItem.data;

  switch (dragData.type) {
    // 1. Arrastrando desde la paleta lateral -> Aplicamos scale(zoom)
    //    El centrado en el cursor lo hace el padre; aquí solo escalamos
    //    el contenido desde su top-left.
    case "palette_element": {
      const effectiveZoom = zoom || 1;
      const scaledWidth = dragData.width * effectiveZoom;
      const scaledHeight = dragData.height * effectiveZoom;

      // Construimos un SeatingElement "sintético" para que ElementShape
      // (el dispatcher) pueda renderizar cualquier tipo de la paleta.
      const synthetic: SeatingElement = {
        id: "drag-overlay",
        type: dragData.elementType as SeatingElement["type"],
        alias: dragData.label,
        x: 0,
        y: 0,
        width: dragData.width,
        height: dragData.height,
        seats: dragData.seats,
        assignedSeats: [],
        rotation: 0,
      };

      return (
        <div
          className="table-element-card"
          data-is-table={dragData.seats > 0}
          data-is-structural={
            dragData.elementType === "wall" ||
            dragData.elementType === "door" ||
            dragData.elementType === "window" ||
            dragData.elementType === "column" ||
            dragData.elementType === "stairs" ||
            dragData.elementType === "aisle"
          }
          data-type={dragData.elementType}
          style={{
            position: "absolute",
            // Offset calculado con el tamaño YA escalado — no con
            // dragData.width/height crudo. Como el padre (el wrapper de
            // CursorCenteredDragOverlay) está anclado exactamente en el
            // cursor sin ningún transform propio, este left/top negativo
            // deja el centro VISUAL (post-scale) del overlay exactamente
            // sobre el cursor, para cualquier valor de zoom.
            left: `${-scaledWidth / 2}px`,
            top: `${-scaledHeight / 2}px`,
            width: `${dragData.width}px`,
            height: `${dragData.height}px`,
            transform: `scale(${effectiveZoom})`,
            transformOrigin: "top left",
          }}
        >
          <ElementShape element={synthetic} />
        </div>
      );
    }

    // 2. Elemento arrastrado dentro del canvas -> Sin overlay
    case "element":
      return null;

    // 3. Arrastre de invitado
    case "guest": {
      const guest = dragData.guest;
      const guestLabel =
        guest.nombre ||
        (guest.familyName && typeof guest.index === "number"
          ? `${guest.familyName} #${guest.index + 1}`
          : guest.familyName || "Invitado");

      const isItalic = !guest.nombre;

      return (
        <div className="inline-flex items-center gap-2 p-1.5 px-3 rounded-lg bg-white border-2 border-[#C5A669] ring-2 ring-[#C5A669]/30 shadow-2xl text-xs whitespace-nowrap">
          <GripVertical size={12} className="text-[#C5A669] shrink-0" />
          <span
            className={`font-medium text-[#2C2C29] ${isItalic ? "italic" : ""}`}
          >
            {guestLabel}
          </span>
        </div>
      );
    }

    // 4. Arrastre de familia
    case "family":
      return (
        <div className="p-2 bg-white border-2 border-[#C5A669] ring-2 ring-[#C5A669]/30 shadow-2xl rounded-lg gap-2 min-w-[160px] inline-flex items-center">
          <GripVertical size={14} className="text-[#C5A669] shrink-0" />
          <span className="font-serif text-xs font-semibold text-[#2C2C29]">
            {dragData.family.name}
          </span>
        </div>
      );

    // 5. Arrastre del diseñador
    case "palette_layout":
      return (
        <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#FDFBF7] border-2 border-dashed border-[#C5A669] ring-4 ring-[#C5A669]/20 shadow-2xl rounded-xl">
          <div className="p-1 bg-amber-50 rounded-md text-[#C5A669]">
            <Sparkles size={14} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#2C2C29]">
              {dragData.label}
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider text-amber-600">
              Crear distribución
            </span>
          </div>
        </div>
      );

    default:
      return null;
  }
}
