import React, { useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useSeatingStore, FamilyElement } from "../../stores/useSeatingStore";
import {
  GripVertical,
  Users,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { DraggableGuest } from "./DraggableGuest";
import Tooltip from "@/features/shared/components/Tooltip";
import { useSeatingModalContext } from "../SeatingModalContext";
import {
  highlightSeats,
  removeHighlightSeats,
} from "../../utils/highlightHelper";

export function DraggableFamily({
  family,
  isFirstElement,
}: {
  family: FamilyElement;
  isFirstElement: boolean;
}) {
  const { elements, removeFamilyFromTable } = useSeatingStore();
  const { triggerFamilyRemoval, triggerAddSeat } = useSeatingModalContext();
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
    <div className="mb-3 bg-[#FDFBF7] rounded-lg border border-[#EBE5DA] flex flex-col min-h-0 select-none">
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={`rounded-lg p-2 bg-white border-b border-[#EBE5DA] flex items-center gap-1.5 transition-colors group/fam shrink-0 ${allAssigned ? "opacity-80 cursor-default" : "hover:bg-[#F9F7F2] cursor-grab active:cursor-grabbing"}`}
        style={{ opacity: isDragging ? 0.3 : 1 }}
        onMouseEnter={() => highlightSeats("family", family.id)}
        onMouseLeave={() => removeHighlightSeats("family", family.id)}
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
          <span className="font-serif text-[13px] font-semibold text-[#2C2C29]">
            {family.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {assignedCount > 0 && (
            <Tooltip
              text="Desasignar familia"
              position={isFirstElement ? "bottom" : "top"}
              align="right"
            >
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFamilyFromTable(family.id);
                }}
                className="p-1 opacity-0 group-hover/fam:opacity-100 transition-opacity hover:bg-red-50 text-red-400 hover:text-red-600 rounded"
              >
                <RotateCcw size={12} />
              </button>
            </Tooltip>
          )}
          <Tooltip
            text="Eliminar familia completa"
            position={isFirstElement ? "bottom" : "top"}
            align="right"
          >
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                triggerFamilyRemoval(family.id);
              }}
              className="p-1 opacity-0 group-hover/fam:opacity-100 transition-opacity hover:bg-red-50 text-red-400 hover:text-red-600 rounded"
            >
              <Trash2 size={12} />
            </button>
          </Tooltip>
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
          className={`p-1.5 space-y-1 ${isDragging ? "hidden" : "block"} bg-white rounded-lg`}
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

          {/* 🔥 Botón interactivo para añadir un asiento rápido al grupo */}
          {/* <button
            onClick={() => triggerAddSeat(family.id)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 mt-1 border border-dashed border-[#EBE5DA] text-[#A8A29E] hover:text-[#C5A669] hover:border-[#C5A669] hover:bg-[#FDFBF7] rounded-md text-[10px] font-bold uppercase tracking-wider transition-all"
          >
            <UserPlus size={11} />
            Agregar Asiento
          </button> */}
        </div>
      )}
    </div>
  );
}
