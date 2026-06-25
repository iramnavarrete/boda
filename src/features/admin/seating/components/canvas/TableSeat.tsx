import React from "react";
import Tooltip from "@/features/shared/components/Tooltip";
import { useSeatingStore } from "../../stores/useSeatingStore";
import { RotateCcw } from "lucide-react";

interface TableSeatProps {
  x: number;
  y: number;
  isDragging: boolean;
  isAssigned: boolean;
  seatNumber: number;
  guestName?: string;
  colorBg?: string;
  colorBorder?: string;
  tableId?: string;
  guestId?: string;
}

export function TableSeat({
  x,
  y,
  isDragging,
  isAssigned,
  seatNumber,
  guestName,
  colorBg = "#EBECEF",
  colorBorder = "#A8AEBA",
  tableId,
  guestId,
}: TableSeatProps) {
  const { removeGuestFromTable } = useSeatingStore();

  const innerContent = (
    <div
      className="w-7 h-7 rounded-full border-2 shadow-sm relative flex items-center justify-center transition-colors duration-200 shrink-0"
      style={{
        backgroundColor: isAssigned ? colorBg : "#EBECEF",
        borderColor: isAssigned ? colorBorder : "#A8AEBA",
      }}
    >
      <span
        className="text-[10px] font-bold"
        style={{ color: isAssigned ? "#2C2C29" : "#A8A29E" }}
      >
        {seatNumber}
      </span>
    </div>
  );

  const wrapperClasses = `absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center ${
    !isDragging ? "pointer-events-auto" : "pointer-events-none"
  }`;

  const wrapperStyle = { left: x, top: y, opacity: isDragging ? 0.3 : 1 };

  const tooltipContent =
    isAssigned && guestName ? (
      <div className="flex items-center gap-2 pl-1">
        <span className="font-medium text-[#2C2C29] whitespace-nowrap">
          {guestName}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (tableId && guestId) {
              removeGuestFromTable(tableId, guestId);
            }
          }}
          className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded transition-colors shrink-0"
          title="Quitar de la mesa"
        >
          <RotateCcw size={12} />
        </button>
      </div>
    ) : (
      `Asiento ${seatNumber}`
    );

  return (
    <div className={wrapperClasses} style={wrapperStyle}>
      <Tooltip
        text={tooltipContent}
        position="top"
        align="center"
        interactive={true}
      >
        {innerContent}
      </Tooltip>
    </div>
  );
}
