import { useDroppable } from "@dnd-kit/core";
import { X, Search } from "lucide-react";
import { DraggableFamily } from "./DraggableFamily";
import { cn } from "@heroui/theme";
import { useGuestAssignment } from "../../hooks/useGuestAssignment";
import { SidebarStats } from "./SidebarStats";
import { SidebarTabs } from "./SidebarTabs";

export default function GuestAssignmentSidebar({
  onClose,
}: {
  onClose?: () => void;
}) {
  const { setNodeRef } = useDroppable({
    id: "guests-area",
    data: { type: "sidebar" },
  });

  // Consumimos toda la lógica desde nuestro Custom Hook segmentado
  const {
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    stats,
    assignedGuestIds,
    filteredAndSortedFamilies,
  } = useGuestAssignment();

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col h-full bg-white shrink-0 select-none w-[320px]"
    >
      <div className="p-4 border-b border-[#EBE5DA] bg-[#FDFBF7] shrink-0">
        {/* HEADER: Título y Total */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-[17px] font-bold text-[#2C2C29]">
              Invitados
            </h2>
            <span className="text-[10px] font-bold text-[#C5A669] bg-amber-50/50 px-2 py-0.5 rounded-md border border-amber-100/50 shadow-sm">
              {stats.guests.total} personas
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 bg-white hover:bg-[#F9F7F2] border border-[#EBE5DA] rounded-md transition-colors text-[#A8A29E] hover:text-[#2C2C29] shadow-sm"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* BADGES SEGMENTADOS */}
        <SidebarStats stats={stats} />

        {/* BUSCADOR COMPACTO */}
        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]"
            size={14}
          />
          <input
            type="text"
            placeholder="Buscar familia..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white border border-[#EBE5DA] rounded-lg text-xs font-medium text-[#2C2C29] focus:outline-none focus:border-[#C5A669] focus:ring-1 focus:ring-[#C5A669]/20 transition-all placeholder:text-[#A8A29E] placeholder:font-normal shadow-sm"
          />
        </div>

        {/* TABS SEGMENTADOS */}
        <SidebarTabs filter={filter} setFilter={setFilter} />
      </div>

      {/* LISTADO DE FAMILIAS CON SCROLL FORZADO */}
      <div className="p-3 overflow-y-scroll overflow-x-hidden flex-1 w-full pb-10 scrollbar-thin scrollbar-thumb-[#EBE5DA]">
        {filteredAndSortedFamilies.length === 0 ? (
          <div className="py-10 flex flex-col items-center text-center text-[#A8A29E]">
            <Search size={24} className="opacity-30 mb-2" />
            <span className="text-xs font-medium text-[#5A5A5A]">
              No se encontraron resultados
            </span>
            <span className="text-[10px] mt-1">
              Intenta con otro término o filtro.
            </span>
          </div>
        ) : (
          filteredAndSortedFamilies.map((family) => {
            const assignedCount = family.guests.filter((g) =>
              assignedGuestIds.has(g.id),
            ).length;
            const isFullyAssigned =
              family.guests.length > 0 &&
              assignedCount === family.guests.length;

            return (
              <div key={family.id} className="relative mb-2">
                <div
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl z-10 pointer-events-none transition-colors opacity-90",
                    isFullyAssigned ? "bg-emerald-400" : "bg-amber-400",
                  )}
                />
                <DraggableFamily
                  family={family}
                  isFirstElement={
                    filteredAndSortedFamilies[0]?.id === family.id
                  }
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
