import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useSeatingStore, FamilyElement } from "../../stores/useSeatingStore";
import { useSeatingModalContext } from "../SeatingModalContext";
import {
  X,
  GripVertical,
  CheckCircle2,
  Edit2,
  RotateCcw,
  Clock,
  XCircle,
  Trash2,
} from "lucide-react";
import Tooltip from "@/features/shared/components/Tooltip";
import {
  highlightSeats,
  removeHighlightSeats,
} from "../../utils/highlightHelper";
import { GuestSeat } from "@/types";

export function DraggableGuest({
  guest,
  family,
  isAssigned,
  tableId,
  tableAlias,
  seatNumber,
}: {
  guest: GuestSeat;
  family: FamilyElement;
  isAssigned: boolean;
  tableId?: string;
  tableAlias?: string;
  seatNumber?: number;
}) {
  const { triggerSeatRemoval } = useSeatingModalContext();
  const removeGuestFromTable = useSeatingStore((state) => state.removeGuestFromTable);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `guest-${guest.id}`,
    data: {
      type: "guest",
      guest: {
        ...guest,
        familyName: family.name,
        index: family.guests.findIndex((g) => g.id === guest.id),
      },
    },
    disabled: isAssigned,
  });

  const guestIndex = family.guests.findIndex((g) => g.id === guest.id);
  const displayName = guest.nombre || `${family.name} #${guestIndex + 1}`;

  const StatusIcon = () => {
    switch (guest.estatus) {
      case "confirmed":
        return <CheckCircle2 size={12} className="text-green-500" />;
      case "declined":
        return <XCircle size={12} className="text-red-400" />;
      default:
        return <Clock size={12} className="text-amber-500" />;
    }
  };

  return (
    <div
      className={`select-none relative flex flex-col gap-1.5 p-1.5 rounded-md border text-xs transition-colors group/guest ${isAssigned ? "bg-transparent border-transparent opacity-70 cursor-default" : guest.estatus === "declined" ? "bg-red-50/50 border-red-100 opacity-60" : "bg-white border border-[#EBE5DA] cursor-grab hover:border-[#C5A669]"}`}
      style={{ opacity: isDragging ? 0.3 : 1 }}
      onMouseEnter={() => highlightSeats("guest", guest.id)}
      onMouseLeave={() => removeHighlightSeats("guest", guest.id)}
    >
      <div className="flex items-center justify-between w-full">
        <div
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          className="flex items-center gap-1.5 flex-1 min-w-0 cursor-grab"
        >
          <GripVertical
            size={12}
            className={isAssigned ? "opacity-0" : "text-[#EBE5DA]"}
          />

          <div className="flex items-center gap-1.5 min-w-0">
            {StatusIcon()}
            <div
              className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
              style={{ backgroundColor: family.colorBg }}
            />
            <span
              className={`truncate font-medium ${guest.nombre ? "text-[#2C2C29]" : "text-[#A8A29E] italic"} ${guest.estatus === "declined" ? "line-through" : ""}`}
            >
              {displayName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover/guest:opacity-100 transition-opacity shrink-0 bg-white/80 rounded pl-1">
          {isAssigned && tableId && (
            <Tooltip position="top" align="right" text="Desasignar">
              <button
                onClick={() => removeGuestFromTable(tableId, guest.id)}
                className="p-1 bg-white border border-[#EBE5DA] shadow-sm hover:bg-red-50 rounded text-red-400 hover:text-red-600"
              >
                <RotateCcw size={10} />
              </button>
            </Tooltip>
          )}
          <Tooltip
            position="top"
            align="right"
            text={
              guest.estatus === "confirmed"
                ? "No puedes eliminar un asiento confirmado"
                : "Eliminar asiento de la lista"
            }
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (guest.estatus === "confirmed") return;
                triggerSeatRemoval(family.id, guest.id);
              }}
              disabled={guest.estatus === "confirmed"}
              className={`p-1 bg-white border border-[#EBE5DA] shadow-sm hover:bg-red-50 rounded ml-0.5 transition-colors ${
                guest.estatus === "confirmed"
                  ? "text-gray-300 cursor-not-allowed opacity-50"
                  : "text-red-500 hover:text-red-700"
              }`}
            >
              <Trash2 size={10} />
            </button>
          </Tooltip>
        </div>
      </div>

      {isAssigned && tableAlias && (
        <span className="text-[9px] font-bold px-1.5 py-[1px] rounded bg-green-50 text-green-700 flex items-center gap-1 border border-green-200 w-fit ml-[38px]">
          <CheckCircle2 size={10} /> {tableAlias} - Ast {seatNumber}
        </span>
      )}
    </div>
  );
}
