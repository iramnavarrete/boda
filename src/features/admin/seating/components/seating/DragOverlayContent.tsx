import React from "react";
import { GripVertical, Sparkles } from "lucide-react";
import { DragItemData } from "@/types/seating";
import { useZoomStore } from "../../stores/useZoomStore";

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

  // Solo aplicamos escala inversa si el arrastre proviene del Canvas.
  // Para elementos de la paleta/sidebar la escala se mantiene siempre en 1.
  const isFromCanvas = dragData.type === "element";
  const scaleValue = isFromCanvas ? 1 / (zoom || 1) : 1;

  const baseOverlayStyle: React.CSSProperties = {
    transform: `scale(${scaleValue})`,
    transformOrigin: "top left",
    display: "inline-flex",
    alignItems: "center",
    whiteSpace: "nowrap",
    pointerEvents: "none",
  };

  switch (dragData.type) {
    case "palette_element":
      return (
        <div
          style={baseOverlayStyle}
          className="z-[99999] gap-2 px-3.5 py-2 rounded-xl bg-white border-2 border-[#C5A669] ring-2 ring-[#C5A669]/30 shadow-2xl cursor-grabbing"
        >
          <span className="text-xs font-semibold text-[#2C2C29]">
            {dragData.label}
          </span>
          {dragData.seats > 0 && (
            <span className="text-[10px] font-bold text-[#C5A669] uppercase tracking-wider">
              {dragData.seats} lugares
            </span>
          )}
        </div>
      );

    case "guest": {
      const { nombre, familyName, index } = dragData.guest;

      const guestLabel =
        nombre ||
        (familyName && typeof index === "number"
          ? `${familyName} #${index + 1}`
          : familyName || "Invitado");

      const isItalic = !nombre;

      return (
        <div
          style={baseOverlayStyle}
          className="z-[99999] gap-2 p-1.5 px-3 rounded-lg bg-white border-2 border-[#C5A669] ring-2 ring-[#C5A669]/30 shadow-2xl cursor-grabbing text-xs"
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

    case "family":
      return (
        <div
          style={baseOverlayStyle}
          className="z-[99999] p-2 bg-white border-2 border-[#C5A669] ring-2 ring-[#C5A669]/30 shadow-2xl rounded-lg gap-2 cursor-grabbing min-w-[160px]"
        >
          <GripVertical size={14} className="text-[#C5A669] shrink-0" />
          <span className="font-serif text-xs font-semibold text-[#2C2C29]">
            {dragData.family.name}
          </span>
        </div>
      );

    case "palette_layout":
      return (
        <div
          style={baseOverlayStyle}
          className="z-[99999] gap-2 px-3.5 py-2 bg-[#FDFBF7] border-2 border-dashed border-[#C5A669] ring-4 ring-[#C5A669]/20 shadow-2xl rounded-xl cursor-grabbing"
        >
          <div className="p-1 bg-amber-50 rounded-md text-[#C5A669]">
            <Sparkles size={14} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#2C2C29]">
              Diseñador de Salón
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
