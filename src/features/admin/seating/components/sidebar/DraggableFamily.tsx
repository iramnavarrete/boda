import React, { useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useSeatingStore, Family } from "../../stores/useSeatingStore";
import {
  GripVertical,
  Users,
  RotateCcw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { DraggableGuest } from "./DraggableGuest";
import Tooltip from "@/features/shared/components/Tooltip";

export function DraggableFamily({ family }: { family: Family }) {
  const { elements, removeFamilyFromTable } = useSeatingStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const assignedCount = useMemo(
    () =>
      family.guests.filter((g) =>
        elements.some((el) => el.assignedSeats.includes(g.id)),
      ).length,
    [family, elements],
  );
  const allAssigned = assignedCount === family.guests.length;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `family-${family.id}`,
    data: { type: "family", family },
    disabled: allAssigned,
  });

  return (
    <div className="mb-3 bg-[#FDFBF7] rounded-lg border border-[#EBE5DA] overflow-hidden flex flex-col min-h-0 select-none">
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={`p-2 bg-white border-b border-[#EBE5DA] flex items-center gap-1.5 transition-colors group shrink-0 ${allAssigned ? "opacity-80 cursor-default" : "hover:bg-[#F9F7F2] cursor-grab active:cursor-grabbing"}`}
        style={{ opacity: isDragging ? 0.3 : 1 }}
      >
        <div
          className={`flex items-center ${allAssigned ? "opacity-0" : "text-[#A8A29E]"}`}
        >
          <GripVertical size={14} />
        </div>
        <div
          className="w-3 h-3 rounded-full border border-black/10 shrink-0"
          style={{ backgroundColor: family.colorBg }}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <span className="font-serif text-[13px] font-semibold text-[#2C2C29] truncate">
            {family.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {assignedCount > 0 && (
            <Tooltip text="Desasignar familia">
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFamilyFromTable(family.id);
                }}
                className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-red-400 hover:text-red-600 rounded"
              >
                <RotateCcw size={12} />
              </button>
            </Tooltip>
          )}
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#F9F7F2] rounded border border-[#EBE5DA]">
            <Users
              size={10}
              className={allAssigned ? "text-green-600" : "text-[#C5A669]"}
            />
            <span className="text-[9px] font-bold text-[#5A5A5A]">
              {assignedCount}/{family.guests.length}
            </span>
          </div>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 text-[#A8A29E] hover:text-[#C5A669] hover:bg-[#EBE5DA] rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div
          className={`p-1.5 space-y-1 ${isDragging ? "hidden" : "block"} bg-white`}
        >
          {family.guests.map((guest) => {
            const table = elements.find((el) =>
              el.assignedSeats.includes(guest.id),
            );
            const seatNumber = table
              ? table.assignedSeats.indexOf(guest.id) + 1
              : undefined;
            return (
              <DraggableGuest
                key={guest.id}
                guest={guest}
                family={family}
                isAssigned={!!table}
                tableId={table?.id}
                tableAlias={table?.alias}
                seatNumber={seatNumber}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
