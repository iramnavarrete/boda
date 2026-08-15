import { memo, useCallback } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  GripVertical,
  CheckCircle2,
  RotateCcw,
  Clock,
  XCircle,
  Trash2,
  Users as UsersIcon,
} from "lucide-react";
import { useSeatingStore } from "../../stores/useSeatingStore";
import { useSeatingModalContext } from "../SeatingModalContext";
import {
  highlightSeats,
  removeHighlightSeats,
} from "../../utils/highlightHelper";
import { GuestSeat } from "@/types";
import { FamilyElement } from "@/types/seating";
import { AssignedSeatInfo } from "../../hooks/useAssignedSeatsMap";
import { cn } from "@heroui/theme";
import Tooltip from "@/features/shared/components/Tooltip";

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

interface DraggableGuestListItemProps {
  guest: GuestSeat;
  family: FamilyElement;
  guestIndex: number;
  isAssigned: boolean;
  assigned?: AssignedSeatInfo;
}

const tooltipPos = "top";

function DraggableGuestListItemBase({
  guest,
  family,
  guestIndex,
  isAssigned,
  assigned
}: DraggableGuestListItemProps) {
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
        index: guestIndex,
      },
    },
    disabled: isAssigned,
  });

  const displayName =
    guest.nombre || `${family.name} #${guestIndex + 1}`;

  const handleRemove = useCallback(() => {
    if (assigned?.tableId) removeGuestFromTable(assigned.tableId, guest.id);
  }, [assigned, guest.id, removeGuestFromTable]);

  const handleDelete = useCallback(() => {
    if (guest.estatus === "confirmed") return;
    triggerSeatRemoval(family.id, guest.id);
  }, [guest.estatus, family.id, guest.id, triggerSeatRemoval]);


  const isDeclined = guest.estatus === "declined";

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "select-none relative flex flex-col gap-1.5 p-2 rounded-lg border text-xs transition-colors group/guest",
        isAssigned
          ? "bg-[#FDFBF7] border-[#EBE5DA] opacity-70 cursor-default"
          : isDeclined
            ? "bg-red-50/40 border-red-100 opacity-60 cursor-grab active:cursor-grabbing aria-pressed:cursor-grabbing hover:border-[#F43F5E]"
            : "bg-white border-[#EBE5DA] cursor-grab active:cursor-grabbing aria-pressed:cursor-grabbing hover:border-[#C5A669]",
      )}
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

          <StatusIcon status={guest.estatus} />

          <span
            className={cn(
              "truncate font-medium",
              guest.nombre ? "text-[#2C2C29]" : "text-[#A8A29E] italic",
              isDeclined && "line-through",
            )}
          >
            {displayName}
          </span>
        </div>

        {/* Badge de familia */}
        <Tooltip text={family.name} position={tooltipPos} align="right">
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md border shrink-0 max-w-[110px]"
            style={{
              backgroundColor: `${family.colorBg}33`, // ~20% opacity
              borderColor: `${family.colorBorder}55`,
            }}
          >
            <div
              className="w-2 h-2 rounded-full border border-black/10 shrink-0"
              style={{ backgroundColor: family.colorBg }}
            />
            <span className="text-[9px] font-bold text-[#5A5A5A] truncate">
              {family.name}
            </span>
            {family.guests.length > 1 && (
              <span className="text-[9px] text-[#A8A29E] font-semibold shrink-0 flex items-center gap-0.5">
                <UsersIcon size={8} />
                {family.guests.length}
              </span>
            )}
          </div>
        </Tooltip>

        <div className="flex items-center gap-1 opacity-0 group-hover/guest:opacity-100 transition-opacity shrink-0 bg-white/80 rounded pl-1">
          {isAssigned && assigned?.tableId && (
            <Tooltip
              position={tooltipPos}
              align="right"
              text="Desasignar"
            >
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleRemove}
                title="Desasignar invitado de la mesa"
                aria-label="Desasignar invitado de la mesa"
                className="p-1 bg-white border border-[#EBE5DA] shadow-sm hover:bg-red-50 rounded text-red-400 hover:text-red-600"
              >
                <RotateCcw size={10} />
              </button>
            </Tooltip>
          )}
          <Tooltip
            position={tooltipPos}
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
              className={cn(
                "p-1 bg-white border border-[#EBE5DA] shadow-sm hover:bg-red-50 rounded ml-0.5 transition-colors",
                guest.estatus === "confirmed"
                  ? "text-gray-300 cursor-not-allowed opacity-50"
                  : "text-red-500 hover:text-red-700",
              )}
            >
              <Trash2 size={10} />
            </button>
          </Tooltip>
        </div>
      </div>

      {isAssigned && assigned && (
        <span className="text-[9px] font-bold px-1.5 py-[1px] rounded bg-green-50 text-green-700 flex items-center gap-1 border border-green-200 w-fit ml-5">
          <CheckCircle2 size={10} /> {assigned.tableAlias} - Ast{" "}
          {assigned.seatNumber}
        </span>
      )}
    </div>
  );
}

export const DraggableGuestListItem = memo(DraggableGuestListItemBase);
