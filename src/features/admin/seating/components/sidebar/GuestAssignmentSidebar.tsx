import { useState, useRef, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  X,
  Search,
  UserMinus,
  AlertTriangle,
  SlidersHorizontal,
} from "lucide-react";
import { DraggableFamily } from "./DraggableFamily";
import { cn } from "@heroui/theme";
import { useGuestAssignment } from "../../hooks/useGuestAssignment";
import { useGuestTagFilter } from "../../hooks/useGuestTagFilter";
import { SidebarStats } from "./SidebarStats";
import { SidebarTabs } from "./SidebarTabs";
import { GuestTagFilter } from "./GuestTagFilter";
import { useVirtualizer } from "@tanstack/react-virtual";

import { UnassignDeclinedPanel } from "./UnassignDeclinedPanel";
import { useSeatingStore } from "../../stores/useSeatingStore";
import Tooltip from "@/features/shared/components/Tooltip";
import { UnassignOptions } from "@/types/seating";

const DECLINED_STATUSES = new Set(["declined", "declinado", "rechazado"]);

type IndicatorColor = "green" | "orange" | "yellow";

/**
 * Verde: todos los invitados están asignados Y ninguno es declined.
 * Naranja: hay invitados pendientes por sentar, O todos están asignados
 *          pero al menos uno es declined (ocupa un slot que podría liberarse).
 * Amarillo: nadie asignado, nadie declined, todo pendiente.
 */
function getIndicatorColor(
  assignedCount: number,
  declinedCount: number,
  totalGuests: number,
): IndicatorColor {
  if (totalGuests === 0) return "yellow";

  // Caso ideal: todos sentados y ninguno declinó.
  if (assignedCount === totalGuests && declinedCount === 0) return "green";

  // Cualquier otra situación requiere atención:
  // - faltan asientos por asignar
  // - o ya todos asignados pero hay declined (slots que podrían liberarse)
  if (assignedCount > 0 || declinedCount > 0) return "orange";
  return "yellow";
}

const INDICATOR_CLASS: Record<IndicatorColor, string> = {
  green: "bg-emerald-400",
  orange: "bg-orange-400",
  yellow: "bg-yellow-400",
};

export default function GuestAssignmentSidebar({
  onClose,
}: {
  onClose?: () => void;
}) {
  const { setNodeRef } = useDroppable({
    id: "guests-area",
    data: { type: "sidebar" },
  });

  const { tagFilter, setTagFilter } = useGuestTagFilter();

  const {
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    stats,
    assignedGuestIds,
    familiesWithCounts,
  } = useGuestAssignment(tagFilter);

  const unassignByCriteria = useSeatingStore(
    (state) => state.unassignByCriteria,
  );
  const elements = useSeatingStore((state) => state.elements);

  const [showUnassignPanel, setShowUnassignPanel] = useState(false);

  const handleUnassignGuests = (options: UnassignOptions) => {
    unassignByCriteria(options);
    setShowUnassignPanel(false);
  };

  const totalSeats = useMemo(
    () => elements.reduce((acc, el) => acc + (el.seats || 0), 0),
    [elements],
  );
  const isOverCapacity = stats.guests.total > totalSeats;
  const missingSeats = stats.guests.total - totalSeats;

  const hasActiveFilters =
    searchQuery !== "" || tagFilter !== "all" || filter !== "all";

  const filteredGuestsTotal = familiesWithCounts.reduce(
    (acc, f) => acc + f.family.guests.length,
    0,
  );

  const familiesLabel = `${familiesWithCounts.length} ${familiesWithCounts.length === 1 ? "familia" : "familias"}`;
  const personsLabel = `${filteredGuestsTotal} ${filteredGuestsTotal === 1 ? "persona" : "personas"}`;

  // ============================================================================
  // CONFIGURACIÓN DE VIRTUALIZACIÓN PARA LA BARRA LATERAL
  // ============================================================================
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: familiesWithCounts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 4,
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col h-full bg-white shrink-0 select-none w-[350px]"
    >
      {/* HEADER DE LA BARRA LATERAL */}
      <div className="p-4 pb-2 border-b border-[#EBE5DA] bg-[#FDFBF7] shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-[17px] font-bold text-[#2C2C29] mr-1">
              Invitados
            </h2>
            <span className="text-[10px] font-bold text-[#C5A669] bg-amber-50/50 px-2 py-0.5 rounded-md border border-amber-100/50 shadow-sm">
              {stats.guests.total} personas
            </span>

            {isOverCapacity && (
              <Tooltip
                text={`Faltan ${missingSeats} asiento${missingSeats > 1 ? "s" : ""} en el plano`}
                position="bottom"
                align="right"
              >
                <div className="flex items-center justify-center p-1 bg-red-50 text-red-500 border border-red-100 rounded-md shadow-sm cursor-help transition-colors hover:bg-red-100">
                  <AlertTriangle size={12} />
                </div>
              </Tooltip>
            )}
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

        <SidebarStats stats={stats} />

        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
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

          <button
            onClick={() => setShowUnassignPanel((prev) => !prev)}
            className={cn(
              "px-2.5 border border-[#EBE5DA] rounded-lg flex items-center justify-center transition-colors shadow-sm",
              showUnassignPanel
                ? "bg-red-50 text-red-500 border-red-200"
                : "bg-white text-[#A8A29E] hover:text-red-500 hover:bg-red-50",
            )}
            title="Liberar asientos"
          >
            <UserMinus size={14} />
          </button>
        </div>

        <SidebarTabs filter={filter} setFilter={setFilter} />

        <GuestTagFilter tagFilter={tagFilter} setTagFilter={setTagFilter} />
      </div>

      {showUnassignPanel && (
        <div className="bg-[#FDFBF7] pt-2">
          <UnassignDeclinedPanel
            onClose={() => setShowUnassignPanel(false)}
            onConfirm={handleUnassignGuests}
          />
        </div>
      )}

      {/* INDICADOR DE FILTROS ACTIVOS */}
      <div className="px-3 pt-2 pb-1 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <div className="flex items-center gap-1.5 text-[10px] text-[#C5A669]">
                <SlidersHorizontal size={11} />
                <span className="font-medium">Resultados filtrados</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#A8A29E]">
              {familiesLabel} · {personsLabel}
            </span>
          </div>
        </div>
      </div>

      {/* LISTADO DE FAMILIAS VIRTUALIZADO (CON MEDIDOR DINÁMICO DE ALTURA) */}
      <div
        ref={parentRef}
        className="px-3 pb-3 overflow-y-scroll overflow-x-hidden flex-1 w-full pt-1 scrollbar-thin scrollbar-thumb-[#EBE5DA]"
      >
        {familiesWithCounts.length === 0 ? (
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
          <div
            className="w-full relative"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const { family, assignedCount, declinedCount } =
                familiesWithCounts[virtualRow.index];
              const totalGuests = family.guests.length;

              const indicatorColor = getIndicatorColor(
                assignedCount,
                declinedCount,
                totalGuests,
              );

              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className="absolute top-0 left-0 w-full"
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="relative w-full h-full">
                    <div
                      className={cn(
                        "absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl z-10 pointer-events-none transition-colors opacity-90",
                        INDICATOR_CLASS[indicatorColor],
                      )}
                    />
                    <DraggableFamily
                      family={family}
                      isFirstElement={virtualRow.index === 0}
                      assignedCount={assignedCount}
                      declinedCount={declinedCount}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
