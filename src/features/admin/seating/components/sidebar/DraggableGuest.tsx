import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useSeatingStore, Family, Guest } from "../../stores/useSeatingStore";
import { X, GripVertical, CheckCircle2, Edit2, RotateCcw } from "lucide-react";
import Tooltip from "@/features/shared/components/Tooltip";

export function DraggableGuest({
  guest,
  family,
  isAssigned,
  tableId,
  tableAlias,
  seatNumber,
}: {
  guest: Guest;
  family: Family;
  isAssigned: boolean;
  tableId?: string;
  tableAlias?: string;
  seatNumber?: number;
}) {
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
  const { updateGuestName, removeGuestFromTable } = useSeatingStore();
  const [isEditing, setIsEditing] = useState(false);
  const [nameValue, setNameValue] = useState(guest.name || "");

  const guestIndex = family.guests.findIndex((g) => g.id === guest.id);
  const displayName = guest.name || `${family.name} #${guestIndex + 1}`;

  return (
    <div
      className={`select-none relative flex flex-col gap-1.5 p-1.5 rounded-md border text-xs transition-colors group ${
        isAssigned
          ? "bg-transparent border-transparent opacity-70 cursor-default"
          : "bg-white border-[#EBE5DA] cursor-grab hover:border-[#C5A669]"
      }`}
      style={{ opacity: isDragging ? 0.3 : isAssigned ? 0.8 : 1 }}
    >
      <div className="flex items-center justify-between w-full">
        {/* Contenedor Izquierdo: Grip, Color y Nombre (o Input) */}
        <div
          ref={!isEditing ? setNodeRef : undefined}
          {...(!isEditing ? attributes : {})}
          {...(!isEditing ? listeners : {})}
          className="flex items-center gap-1.5 flex-1 min-w-0"
        >
          <GripVertical
            size={12}
            className={isAssigned || isEditing ? "opacity-0" : "text-[#EBE5DA]"}
          />
          <div
            className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
            style={{ backgroundColor: family.colorBg }}
          />

          {isEditing ? (
            <input
              autoFocus
              className="flex-1 text-[11px] border-b border-[#C5A669] bg-transparent outline-none focus:border-b-2 font-medium text-[#2C2C29]"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              placeholder={displayName}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (updateGuestName(family.id, guest.id, nameValue),
                setIsEditing(false))
              }
            />
          ) : (
            <span
              className={`truncate font-medium ${
                guest.name ? "text-[#2C2C29]" : "text-[#A8A29E] italic"
              }`}
            >
              {displayName}
            </span>
          )}
        </div>

        {/* Contenedor Derecho: Botones */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-white/80 rounded pl-1">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  updateGuestName(family.id, guest.id, nameValue);
                  setIsEditing(false);
                }}
                className="text-[9px] uppercase font-bold bg-[#C5A669] text-white px-1.5 py-0.5 rounded ml-1"
              >
                Ok
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-[#A8A29E] hover:text-red-500 p-0.5"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <>
              <Tooltip text="Asignar nombre">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setNameValue(guest.name || "");
                  }}
                  className="p-1 hover:bg-[#F9F7F2] rounded text-[#C5A669] shadow-sm bg-white border border-[#EBE5DA]"
                >
                  <Edit2 size={10} />
                </button>
              </Tooltip>
              {isAssigned && tableId && (
                <Tooltip text="Desasignar">
                  <button
                    onClick={() => removeGuestFromTable(tableId, guest.id)}
                    className="p-1 bg-white border border-[#EBE5DA] shadow-sm hover:bg-red-50 rounded text-red-400 hover:text-red-600"
                  >
                    <RotateCcw size={10} />
                  </button>
                </Tooltip>
              )}
            </>
          )}
        </div>
      </div>

      {/* Renglón Inferior: Asignación */}
      {isAssigned && tableAlias && !isEditing && (
        <span className="text-[9px] font-bold px-1.5 py-[1px] rounded bg-green-50 text-green-700 flex items-center gap-1 border border-green-200 w-fit ml-[22px]">
          <CheckCircle2 size={10} /> {tableAlias} - Ast {seatNumber}
        </span>
      )}
    </div>
  );
}
