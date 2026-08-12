import Tooltip from "@/features/shared/components/Tooltip";
import { useSeatingStore } from "../../stores/useSeatingStore";
import { RotateCcw, Trash2 } from "lucide-react";
import { useSeatingModalContext } from "../SeatingModalContext";
import { GuestStatus } from "@/types";
import { useDraggable } from "@dnd-kit/core";
import {
  highlightSeats,
  removeHighlightSeats,
} from "../../utils/highlightHelper";

interface TableSeatProps {
  x: number;
  y: number;
  isDragging?: boolean;
  isAssigned: boolean;
  seatNumber: number;
  guestName?: string;
  status?: GuestStatus;
  colorBg?: string;
  colorBorder?: string;
  tableId?: string;
  guestId?: string;
}

export function TableSeat({
  x,
  y,
  isDragging: isParentDragging = false,
  isAssigned,
  seatNumber,
  guestName,
  status,
  colorBg = "#EBECEF",
  colorBorder = "#A8AEBA",
  tableId,
  guestId,
}: TableSeatProps) {
  const removeGuestFromTable = useSeatingStore(
    (state) => state.removeGuestFromTable,
  );
  const families = useSeatingStore((state) => state.families);
  const { triggerSeatRemoval } = useSeatingModalContext();

  // Buscar la familia y el invitado correspondientes
  const family = guestId
    ? families.find((f) => f.guests.some((g) => g.id === guestId))
    : undefined;

  const guest = guestId
    ? family?.guests.find((g) => g.id === guestId)
    : undefined;

  const canDrag = Boolean(isAssigned && guestId);
  const guestIndex =
    family && guestId ? family.guests.findIndex((g) => g.id === guestId) : -1;

  // Integración Draggable para asientos asignados
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `guest-${guestId}`,
    data: {
      type: "guest",
      guest: {
        id: guestId || "",
        nombre: guestName || guest?.nombre || "",
        estatus: status || "pending",
        familyName: family?.name || guestName || "Invitado",
        index: guestIndex >= 0 ? guestIndex : 0,
      },
    },
    disabled: !canDrag,
  });

  const getStatusBadge = () => {
    if (!isAssigned) return null;
    switch (status) {
      case "confirmed":
        return (
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm" />
        );
      case "declined":
        return (
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm" />
        );
      default: // pending
        return (
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm" />
        );
    }
  };

  // 🔥 listeners, attributes y ref asignados directamente al círculo interior con touch-none
  const innerContent = (
    <div
      ref={setNodeRef}
      {...(canDrag ? attributes : {})}
      {...(canDrag ? listeners : {})}
      className={`seat-inner w-7 h-7 rounded-full border-2 shadow-sm relative flex items-center justify-center transition-colors duration-200 shrink-0 touch-none ${
        canDrag ? "cursor-grab active:cursor-grabbing" : ""
      }`}
      style={{
        backgroundColor: isAssigned ? colorBg : "#EBECEF",
        borderColor: isAssigned ? colorBorder : "#A8AEBA",
      }}
    >
      <span
        className="text-[10px] font-bold select-none"
        style={{ color: isAssigned ? "#2C2C29" : "#A8A29E" }}
      >
        {seatNumber}
      </span>
      {getStatusBadge()}
    </div>
  );

  const wrapperClasses = `seat-wrapper absolute transform -translate-x-1/2 -translate-y-1/2 z-20 hover:z-50 flex items-center justify-center ${
    !isParentDragging && !isDragging
      ? "pointer-events-auto"
      : "pointer-events-none"
  }`;

  const wrapperStyle = {
    left: x,
    top: y,
    opacity: isDragging || isParentDragging ? 0.3 : 1,
  };

  const tooltipContent =
    isAssigned && guestName ? (
      <div className="flex items-center gap-2 pl-1">
        <div className="flex flex-col">
          <span className="font-medium text-[#2C2C29] whitespace-nowrap leading-none">
            {guestName}
          </span>
          <span
            className={`text-[9px] font-bold uppercase mt-1 ${
              status === "confirmed"
                ? "text-green-600"
                : status === "declined"
                  ? "text-red-600"
                  : "text-amber-600"
            }`}
          >
            {status === "confirmed"
              ? "Confirmado"
              : status === "declined"
                ? "Declinado"
                : "Pendiente"}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (tableId && guestId) removeGuestFromTable(tableId, guestId);
          }}
          className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded transition-colors shrink-0"
        >
          <RotateCcw size={12} />
        </button>
        {guestId && status !== "confirmed" && family && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerSeatRemoval(family.id, guestId);
            }}
            className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition-colors shrink-0 ml-0.5"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    ) : (
      `Asiento ${seatNumber}`
    );

  return (
    <div
      className={wrapperClasses}
      style={wrapperStyle}
      data-guest-id={guestId}
      data-family-id={family?.id}
      onMouseEnter={() => guestId && highlightSeats("guest", guestId)}
      onMouseLeave={() => guestId && removeHighlightSeats("guest", guestId)}
    >
      {/* Ocultar tooltip mientras arrastramos para evitar bloqueos del cursor */}
      {isDragging ? (
        innerContent
      ) : (
        <Tooltip
          text={tooltipContent}
          position="top"
          align="center"
          interactive={true}
        >
          {innerContent}
        </Tooltip>
      )}
    </div>
  );
}
