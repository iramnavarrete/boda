import React from "react";
import { GripVertical, Sparkles } from "lucide-react";
import { DragItemData } from "@/types/seating";
import { useZoomStore } from "../../stores/useZoomStore";
import { TableShape } from "../canvas/TableShape";

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
    case "palette_element": {
      return (
        <div
          style={{
            width: `${dragData.width}px`,
            height: `${dragData.height}px`,
            transform: `scale(${zoom || 1})`,
            transformOrigin: "top left",
            pointerEvents: "none",
          }}
          className="z-[99999] relative table-element-card"
          data-is-table={dragData.seats > 0}
          data-type={dragData.elementType}
        >
          <TableShape
            type={dragData.elementType}
            width={dragData.width}
            height={dragData.height}
            seatsCount={dragData.seats}
            alias={dragData.label}
          />
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
        <div
          style={{ pointerEvents: "none" }}
          className="z-[99999] inline-flex items-center gap-2 p-1.5 px-3 rounded-lg bg-white border-2 border-[#C5A669] ring-2 ring-[#C5A669]/30 shadow-2xl cursor-grabbing text-xs whitespace-nowrap"
        >
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
        <div
          style={{ pointerEvents: "none" }}
          className="z-[99999] p-2 bg-white border-2 border-[#C5A669] ring-2 ring-[#C5A669]/30 shadow-2xl rounded-lg gap-2 cursor-grabbing min-w-[160px] inline-flex items-center"
        >
          <GripVertical size={14} className="text-[#C5A669] shrink-0" />
          <span className="font-serif text-xs font-semibold text-[#2C2C29]">
            {dragData.family.name}
          </span>
        </div>
      );

    // 5. Arrastre del diseñador
    case "palette_layout":
      return (
        <div
          style={{ pointerEvents: "none" }}
          className="z-[99999] inline-flex items-center gap-2 px-3.5 py-2 bg-[#FDFBF7] border-2 border-dashed border-[#C5A669] ring-4 ring-[#C5A669]/20 shadow-2xl rounded-xl cursor-grabbing"
        >
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
