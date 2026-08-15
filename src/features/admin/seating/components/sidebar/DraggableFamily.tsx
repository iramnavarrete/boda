import { useState, useCallback, memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useSeatingStore } from "../../stores/useSeatingStore";
import {
  GripVertical,
  Users,
  ChevronDown,
  ChevronRight,
  Trash2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import Tooltip from "@/features/shared/components/Tooltip";
import { useSeatingModalContext } from "../SeatingModalContext";
import {
  highlightSeats,
  removeHighlightSeats,
} from "../../utils/highlightHelper";
import { DraggableGuest } from "./DraggableGuest";
import { FamilyElement } from "@/types/seating";
import { useAssignedSeatsMap } from "../../hooks/useAssignedSeatsMap";

interface DraggableFamilyProps {
  family: FamilyElement;
  /** Pre-calculado por el padre para evitar loops en cada item. */
  assignedCount: number;
  /** Pre-calculado por el padre. */
  declinedCount: number;
}

function DraggableFamilyBase({
  family,
  assignedCount,
  declinedCount,
}: DraggableFamilyProps) {
  const removeFamilyFromTable = useSeatingStore(
    (state) => state.removeFamilyFromTable,
  );
  const { triggerFamilyRemoval } = useSeatingModalContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const assignedMap = useAssignedSeatsMap();

  // Para deshabilitar el drag: la familia está "completa" cuando no quedan
  // invitados pendientes (asignados o declined cuentan como resueltos).
  const allAssigned = assignedCount + declinedCount >= family.guests.length;
  const hasDeclined = declinedCount > 0;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `family-${family.id}`,
    data: { type: "family", family },
    disabled: allAssigned,
  });

  const handleToggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((v) => !v);
  }, []);

  return (
    <div className="mb-1.5 bg-[#FDFBF7] rounded-lg border border-[#EBE5DA] flex flex-col min-h-0 select-none">
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={`select-none relative flex items-center justify-between gap-1.5 p-2 rounded-lg border text-xs transition-colors group/fam ${
          allAssigned
            ? "bg-[#FDFBF7] border-[#EBE5DA] opacity-80 cursor-default"
            : hasDeclined
              ? "bg-red-50/40 border-red-100 cursor-grab active:cursor-grabbing aria-pressed:cursor-grabbing hover:border-[#F43F5E]"
              : "bg-white border-[#EBE5DA] cursor-grab active:cursor-grabbing aria-pressed:cursor-grabbing hover:border-[#C5A669]"
        }`}
        style={{ opacity: isDragging ? 0.3 : 1 }}
        onMouseEnter={() => highlightSeats("family", family.id)}
        onMouseLeave={() => removeHighlightSeats("family", family.id)}
      >
        {/* Izquierda: grip + color dot + nombre */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <GripVertical
            size={12}
            className={allAssigned ? "opacity-0" : "text-[#EBE5DA]"}
          />
          <div
            className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
            style={{ backgroundColor: family.colorBg }}
          />
          <span
            className={`truncate font-serif text-[13px] font-semibold ${
              hasDeclined ? "text-[#A8A29E]" : "text-[#2C2C29]"
            }`}
          >
            {family.name}
          </span>
        </div>

        {/* Derecha: badges de estado + actions + chevron */}
        <div className="flex items-center gap-1 shrink-0">
          {hasDeclined && (
            <Tooltip
              text={`${declinedCount} invitado${declinedCount > 1 ? "s" : ""} declinado${declinedCount > 1 ? "s" : ""}`}
              position="top"
              align="right"
            >
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-50/80 rounded-md border border-red-100 cursor-default">
                <XCircle size={10} className="text-red-400" />
                <span className="text-[9px] font-bold text-red-500">
                  {declinedCount}
                </span>
              </div>
            </Tooltip>
          )}

          <Tooltip
            text={
              assignedCount === 0
                ? "Sin asignar"
                : assignedCount === family.guests.length
                  ? "Todos asignados"
                  : `${assignedCount} de ${family.guests.length} personas asignadas`
            }
            position="top"
            align="right"
          >
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#F9F7F2] rounded-md border border-[#EBE5DA] cursor-help">
              <Users
                size={10}
                className={
                  allAssigned
                    ? "text-green-600"
                    : assignedCount > 0
                      ? "text-orange-400"
                      : "text-[#C5A669]"
                }
              />
              <span className="text-[9px] font-bold text-[#5A5A5A]">
                {assignedCount}/{family.guests.length}
              </span>
            </div>
          </Tooltip>

          <div className="flex items-center gap-1 max-w-0 opacity-0 overflow-hidden transition-all duration-200 group-hover/fam:max-w-[120px] group-hover/fam:opacity-100 shrink-0 bg-white/80 rounded pl-1">
            {assignedCount > 0 && (
              <Tooltip text="Desasignar familia" position="top" align="right">
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFamilyFromTable(family.id);
                  }}
                  className="p-1 bg-white border border-[#EBE5DA] shadow-sm hover:bg-red-50 rounded text-red-400 hover:text-red-600 transition-colors"
                >
                  <RotateCcw size={10} />
                </button>
              </Tooltip>
            )}
            <Tooltip text="Eliminar familia" position="top" align="right">
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFamilyRemoval(family.id);
                }}
                className="p-1 bg-white border border-[#EBE5DA] shadow-sm hover:bg-red-50 rounded ml-0.5 text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 size={10} />
              </button>
            </Tooltip>
          </div>

          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleToggleExpand}
            className="p-0.5 text-[#A8A29E] hover:text-[#C5A669] hover:bg-[#EBE5DA] rounded transition-colors"
            aria-label={isExpanded ? "Contraer familia" : "Expandir familia"}
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
          className={`flex flex-col gap-1 px-2 pt-1.5 pb-2 ${isDragging ? "hidden" : "flex"}`}
        >
          {family.guests.map((guest) => {
            const assigned = guest.id ? assignedMap.get(guest.id) : undefined;
            return (
              <DraggableGuest
                key={guest.id}
                guest={guest}
                family={family}
                isAssigned={!!assigned}
                tableId={assigned?.tableId}
                tableAlias={assigned?.tableAlias}
                seatNumber={assigned?.seatNumber}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export const DraggableFamily = memo(DraggableFamilyBase);
