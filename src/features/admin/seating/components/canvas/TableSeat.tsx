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
import { useGuestLookupMap } from "../../hooks/useGuestLookupMap";

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
  /**
   * Tamaño del asiento en px. Por defecto 28 (mismo tamaño que todas
   * las mesas regulares y el lounge). Se mantiene como prop interna
   * por si en el futuro se quiere un tamaño custom.
   */
  size?: number;
}

const STATUS_BADGE_COLOR: Record<string, string> = {
  confirmed: "bg-green-500",
  declined: "bg-red-500",
};

function StatusBadge({ status }: { status?: GuestStatus }) {
  if (!status) return null;
  const color = STATUS_BADGE_COLOR[status] ?? "bg-amber-500";
  return (
    <div
      className={`status-badge absolute -top-1 -right-1 w-3.5 h-3.5 ${color} rounded-full border-2 border-white shadow-sm`}
    />
  );
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
  size = 28,
}: TableSeatProps) {
  const removeGuestFromTable = useSeatingStore(
    (state) => state.removeGuestFromTable,
  );
  const guestMap = useGuestLookupMap();
  const { triggerSeatRemoval } = useSeatingModalContext();

  // Lookup O(1) en lugar de buscar en families
  const guestInfo = guestId ? guestMap.get(guestId) : undefined;
  const family = guestInfo
    ? { id: guestInfo.familyId, name: guestInfo.familyName }
    : undefined;

  const canDrag = Boolean(isAssigned && guestId);
  const guestIndex = guestInfo?.index ?? -1;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `guest-${guestId}`,
    data: {
      type: "guest",
      guest: {
        id: guestId || "",
        nombre: guestName || guestInfo?.nombre || "",
        estatus: status || "pending",
        familyName: family?.name || guestName || "Invitado",
        index: guestIndex >= 0 ? guestIndex : 0,
      },
    },
    disabled: !canDrag,
  });

  const innerContent = (
    <div
      ref={setNodeRef}
      {...(canDrag ? attributes : {})}
      {...(canDrag ? listeners : {})}
      className={`seat-inner rounded-full border-2 shadow-sm relative flex items-center justify-center transition-colors duration-200 shrink-0 touch-none ${
        canDrag ? "cursor-grab active:cursor-grabbing" : ""
      }`}
      style={{
        width: size,
        height: size,
        backgroundColor: isAssigned ? colorBg : "#EBECEF",
        borderColor: isAssigned ? colorBorder : "#A8AEBA",
      }}
    >
      <span
        className="font-bold select-none"
        style={{
          fontSize: Math.max(10, Math.round(size * 0.28)),
          color: isAssigned ? "#2C2C29" : "#A8A29E",
        }}
      >
        {seatNumber}
      </span>
      <StatusBadge status={status} />
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
    // Solo aplicar opacidad reducida cuando ESTE asiento (invitado)
    // se está arrastrando, NO cuando su mesa padre se arrastra.
    // Antes también aplicaba fade con `isParentDragging`, lo cual
    // hacía que TODOS los asientos de las mesas arrastradas se
    // volvieran transparentes al multi-select, distrayendo sin
    // aportar información útil.
    opacity: isDragging ? 0.3 : 1,
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
          title="Desasignar invitado"
          className="p-1 hover:bg-red-50 text-amber-500 hover:text-amber-700 rounded transition-colors shrink-0"
        >
          <RotateCcw size={12} />
        </button>
        {guestId && status !== "confirmed" && family && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerSeatRemoval(family.id, guestId);
            }}
            title="Eliminar invitado"
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
