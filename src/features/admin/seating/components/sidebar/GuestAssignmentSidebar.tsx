import React, { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSeatingStore } from "../../stores/useSeatingStore";
import { X } from "lucide-react";
import { DraggableFamily } from "./DraggableFamily";

export default function GuestAssignmentSidebar({
  onClose,
}: {
  onClose?: () => void;
}) {
  const { families, elements } = useSeatingStore();
  const { setNodeRef } = useDroppable({
    id: "guests-area",
    data: { type: "sidebar" },
  });

  const stats = useMemo(() => {
    let total = 0,
      assigned = 0;
    families.forEach((f) => {
      total += f.guests.length;
      f.guests.forEach((g) => {
        if (elements.some((el) => el.assignedSeats.includes(g.id))) assigned++;
      });
    });
    return { total, assigned, unassigned: total - assigned };
  }, [families, elements]);

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col h-full w-full bg-white flex-1 min-h-0 select-none"
      style={{ minWidth: "16rem" }}
    >
      <div className="p-3 border-b border-[#EBE5DA] bg-[#FDFBF7] shrink-0">
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-col">
            <h2 className="font-serif text-[15px] font-semibold text-[#2C2C29]">
              Invitados
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 bg-white rounded-md border border-[#EBE5DA]"
            >
              <X size={14} className="text-[#A8A29E]" />
            </button>
          )}
        </div>
        <div className="flex gap-2 text-xs font-medium">
          <div className="flex-1 bg-green-50/50 text-green-700 py-1.5 px-2 rounded-md flex flex-col border border-green-200">
            <span className="text-[9px] uppercase font-bold text-green-600/80">
              Asignados
            </span>
            <span className="text-sm font-serif">{stats.assigned}</span>
          </div>
          <div className="flex-1 bg-orange-50/50 text-orange-700 py-1.5 px-2 rounded-md flex flex-col border border-orange-200">
            <span className="text-[9px] uppercase font-bold text-orange-600/80">
              Pendientes
            </span>
            <span className="text-sm font-serif">{stats.unassigned}</span>
          </div>
        </div>
      </div>
      <div className="p-3 overflow-y-auto flex-1 w-full pb-10">
        {families.map((family) => (
          <DraggableFamily key={family.id} family={family} />
        ))}
      </div>
    </div>
  );
}
