import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSeatingStore } from "../../stores/useSeatingStore";
import { X, Users, Armchair } from "lucide-react";
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
    let totalGuests = 0;
    let assignedGuests = 0;

    // Cálculo de Invitados
    families.forEach((f) => {
      totalGuests += f.guests.length;
      f.guests.forEach((g) => {
        if (elements.some((el) => el.assignedSeats.includes(g.id))) {
          assignedGuests++;
        }
      });
    });

    let totalSeats = 0;
    let occupiedSeats = 0;

    // Cálculo de Asientos en el plano
    elements.forEach((el) => {
      if (el.seats && el.seats > 0) {
        totalSeats += el.seats;
        occupiedSeats += el.assignedSeats.length;
      }
    });

    return {
      guests: {
        total: totalGuests,
        assigned: assignedGuests,
        pending: totalGuests - assignedGuests,
      },
      seats: {
        total: totalSeats,
        occupied: occupiedSeats,
        available: totalSeats - occupiedSeats,
      },
    };
  }, [families, elements]);

  const sortedFamilies = useMemo(() => {
    return [...families].sort((a, b) => {
      const aIsFullyAssigned =
        a.guests.length > 0 &&
        a.guests.every((g) =>
          elements.some((el) => el.assignedSeats.includes(g.id)),
        );
      const bIsFullyAssigned =
        b.guests.length > 0 &&
        b.guests.every((g) =>
          elements.some((el) => el.assignedSeats.includes(g.id)),
        );

      if (aIsFullyAssigned && !bIsFullyAssigned) return 1;
      if (!aIsFullyAssigned && bIsFullyAssigned) return -1;
      return 0; // Mantiene el orden original si ambas están en el mismo estado
    });
  }, [families, elements]);

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col h-full w-full bg-white flex-1 min-h-0 select-none max-w-72"
      style={{ minWidth: "16.5rem" }}
    >
      <div className="p-3 border-b border-[#EBE5DA] bg-[#FDFBF7] shrink-0">
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-col">
            <h2 className="font-serif text-[15px] font-semibold text-[#2C2C29]">
              Asignación
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

        {/* Tarjetas de Estadísticas */}
        <div className="flex flex-col gap-2.5">
          {/* SECCIÓN: ASIENTOS */}
          <div className="bg-white p-2 rounded-lg border border-[#EBE5DA] shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[#5A5A5A]">
                <Armchair size={12} />
                <span className="text-[10px] uppercase font-bold tracking-widest">
                  Lugares
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#A8A29E] bg-[#F9F7F2] px-1.5 py-0.5 rounded border border-[#EBE5DA]">
                Total: {stats.seats.total}
              </span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-blue-50/50 border border-blue-100/50 rounded-md flex flex-col items-center py-1">
                <span className="text-[14px] font-serif font-bold text-blue-700">
                  {stats.seats.occupied}
                </span>
                <span className="text-[8px] uppercase font-bold text-blue-500/80">
                  Ocupados
                </span>
              </div>
              <div className="flex-1 bg-gray-50/50 border border-gray-100 rounded-md flex flex-col items-center py-1">
                <span className="text-[14px] font-serif font-bold text-[#5A5A5A]">
                  {stats.seats.available}
                </span>
                <span className="text-[8px] uppercase font-bold text-[#A8A29E]">
                  Disponibles
                </span>
              </div>
            </div>
          </div>

          {/* SECCIÓN: INVITADOS */}
          <div className="bg-white p-2 rounded-lg border border-[#EBE5DA] shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[#5A5A5A]">
                <Users size={12} />
                <span className="text-[10px] uppercase font-bold tracking-widest">
                  Invitados
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#A8A29E] bg-[#F9F7F2] px-1.5 py-0.5 rounded border border-[#EBE5DA]">
                Total: {stats.guests.total}
              </span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-green-50/50 border border-green-100/50 rounded-md flex flex-col items-center py-1">
                <span className="text-[14px] font-serif font-bold text-green-700">
                  {stats.guests.assigned}
                </span>
                <span className="text-[8px] uppercase font-bold text-green-600/80">
                  Sentados
                </span>
              </div>
              <div className="flex-1 bg-orange-50/50 border border-orange-100/50 rounded-md flex flex-col items-center py-1">
                <span className="text-[14px] font-serif font-bold text-orange-600">
                  {stats.guests.pending}
                </span>
                <span className="text-[8px] uppercase font-bold text-orange-500/80">
                  Pendientes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 overflow-y-auto flex-1 w-full pb-10">
        {sortedFamilies.map((family) => (
          <DraggableFamily key={family.id} family={family} isFirstElement={sortedFamilies[0].id === family.id } />
        ))}
      </div>
    </div>
  );
}
