import { GripVertical, Sparkles } from "lucide-react";
import { DragItemData } from "@/types/seating";

interface DragOverlayContentProps {
  activeDragItem: {
    type?: string;
    data: DragItemData | null;
  } | null;
}

export function DragOverlayContent({
  activeDragItem,
}: DragOverlayContentProps) {
  if (!activeDragItem?.data) return null;

  const dragData = activeDragItem.data;

  switch (dragData.type) {
    case "palette_element":
      return (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border-2 border-[#C5A669] ring-2 ring-[#C5A669]/30 shadow-2xl pointer-events-none cursor-grabbing opacity-90">
          <span className="text-sm font-semibold text-[#2C2C29]">
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
      const { familyName, index } = dragData.guest;
      const guestLabel =
        familyName && typeof index === "number"
          ? `${familyName} #${index + 1}`
          : "Invitado";

      return (
        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-[#C5A669] ring-2 ring-[#C5A669]/50 shadow-2xl scale-105 pointer-events-none cursor-grabbing text-xs">
          <GripVertical size={12} className="text-[#C5A669]" />
          <span className="flex-1 truncate font-medium italic text-[#2C2C29]">
            {guestLabel}
          </span>
        </div>
      );
    }

    case "family":
      return (
        <div className="p-2 bg-white border border-[#C5A669] ring-2 ring-[#C5A669]/50 shadow-2xl rounded-lg scale-105 pointer-events-none flex items-center gap-2 cursor-grabbing min-w-[180px]">
          <GripVertical size={14} className="text-[#C5A669]" />
          <span className="font-serif text-[13px] font-semibold text-[#2C2C29]">
            {dragData.family.name}
          </span>
        </div>
      );

    case "palette_layout":
      return (
        <div className="flex items-center gap-2 px-4 py-3 bg-[#FDFBF7] border-2 border-dashed border-[#C5A669] ring-4 ring-[#C5A669]/20 shadow-2xl rounded-xl scale-105 pointer-events-none cursor-grabbing opacity-90">
          <div className="p-1.5 bg-amber-50 rounded-md text-[#C5A669]">
            <Sparkles size={16} />
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
