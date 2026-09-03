import { useDraggable } from "@dnd-kit/core";
import { useSeatingStore } from "../../stores/useSeatingStore";
import { useSeatingModalContext } from "../SeatingModalContext";
import {
  GripVertical,
  CheckCircle2,
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
import { FamilyElement } from "@/types/seating";
import { memo, useCallback } from "react";

interface DraggableGuestProps {
  guest: GuestSeat;
  family: FamilyElement;
  isAssigned: boolean;
  tableId?: string;
  tableAlias?: string;
  seatNumber?: number;
}

const STATUS_ICON: Record<string, React.ElementType> = {
  confirmed: CheckCircle2,
  declined: XCircle,
};

function StatusIcon({ status }: { status?: string }) {
  const Icon = STATUS_ICON[status || ""] ?? Clock;
  const color =
    status === "confirmed"
      ? "text-green-500"
      : status === "declined"
        ? "text-red-400"
        : "text-amber-500";
  return <Icon size={12} className={color} />;
}

function DraggableGuestBase({
  guest,
  family,
  isAssigned,
  tableId,
  tableAlias,
  seatNumber,
}: DraggableGuestProps) {
  const { triggerSeatRemoval } = useSeatingModalContext();
  const removeGuestFromTable = useSeatingStore(
    (state) => state.removeGuestFromTable,
  );

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

  const handleRemove = useCallback(() => {
    if (tableId) removeGuestFromTable(tableId, guest.id);
  }, [tableId, guest.id, removeGuestFromTable]);

  const handleDelete = useCallback(() => {
    if (guest.estatus === "confirmed") return;
    triggerSeatRemoval(family.id, guest.id);
  }, [guest.estatus, family.id, guest.id, triggerSeatRemoval]);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`select-none relative flex flex-col gap-1.5 p-1.5 rounded-md border text-xs transition-colors group/guest ${isAssigned ? "bg-[#FDFBF7] border-[#EBE5DA] opacity-70 cursor-default" : guest.estatus === "declined" ? "bg-red-50/50 border-red-100 opacity-60 cursor-grab active:cursor-grabbing aria-pressed:cursor-grabbing hover:border-[#F43F5E]" : "bg-white border border-[#EBE5DA] cursor-grab active:cursor-grabbing aria-pressed:cursor-grabbing hover:border-[#C5A669]"}`}
      style={{ opacity: isDragging ? 0.3 : 1 }}
      onMouseEnter={() => highlightSeats("guest", guest.id)}
      onMouseLeave={() => removeHighlightSeats("guest", guest.id)}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <GripVertical
            size={12}
            className={isAssigned ? "opacity-0" : "text-[#EBE5DA]"}
          />

          <div className="flex items-center gap-1.5 min-w-0">
            <StatusIcon status={guest.estatus} />
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

        <div className="flex items-center gap-1 max-w-0 opacity-0 overflow-hidden transition-all duration-200 group-hover/guest:max-w-[120px] group-hover/guest:opacity-100 shrink-0 bg-white/80 rounded pl-1">
          {isAssigned && tableId && (
            <Tooltip
              position="top"
              align="right"
              text="Desasignar"
            >
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleRemove}
                title="Desasignar invitado de la mesa"
                aria-label="Desasignar invitado de la mesa"
                className="p-1 bg-white border border-[#EBE5DA] shadow-sm hover:bg-red-50 rounded text-amber-500 hover:text-amber-700"
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
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleDelete}
              disabled={guest.estatus === "confirmed"}
              title={
                guest.estatus === "confirmed"
                  ? "No puedes eliminar un asiento confirmado"
                  : "Eliminar asiento de la lista"
              }
              aria-label={
                guest.estatus === "confirmed"
                  ? "No puedes eliminar un asiento confirmado"
                  : "Eliminar asiento de la lista"
              }
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

export const DraggableGuest = memo(DraggableGuestBase);
