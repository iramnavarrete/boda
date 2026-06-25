import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  GripVertical,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  LayoutTemplate,
  Users,
} from "lucide-react";
import { ElementType, Family, Guest, useSeatingStore } from "../../stores/useSeatingStore";
import ElementsPalette from "./ElementsPalette";
import SeatingCanvas from "../canvas/SeatingCanvas";
import GuestAssignmentSidebar from "../sidebar/GuestAssignmentSidebar";

export type DragItemData =
  | {
      type: "palette_element";
      elementType: ElementType;
      width: number;
      height: number;
      seats: number;
      label: string;
    }
  | { type: "element" }
  | { type: "guest"; guest: Guest & { familyName?: string; index?: number } }
  | { type: "family"; family: Family }
  | Record<string, unknown>;

export default function SeatingManager() {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );
  const {
    updateElementPosition,
    assignGuestToTable,
    assignFamilyToTable,
    addElement,
    elements,
    zoom,
    toastMsg,
    showToast,
  } = useSeatingStore();
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [activeDragItem, setActiveDragItem] = useState<{
    id: string;
    type: string | undefined;
    data: DragItemData | null;
  } | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem({
      id: String(event.active.id),
      type: event.active.data.current?.type,
      data: event.active.data.current as DragItemData,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = event;

    if (active.data.current?.type === "palette_element") {
      if (over?.id === "palette-area" || over?.id === "guests-area") {
        showToast("Arrastra el elemento hacia el área del plano.");
        return;
      }
      const d = active.data.current as Extract<
        DragItemData,
        { type: "palette_element" }
      >;
      const isTable = d.seats > 0;
      const tablesCount = elements.filter((e) => e.seats > 0).length + 1;
      const alias = isTable ? `Mesa ${tablesCount}` : d.label;

      const canvasEl = document.querySelector(".canvas-droppable-area");
      let dropX = 400,
        dropY = 300;
      if (canvasEl && active.rect.current.translated) {
        const rect = canvasEl.getBoundingClientRect();
        dropX = (active.rect.current.translated.left - rect.left) / zoom;
        dropY = (active.rect.current.translated.top - rect.top) / zoom;
      }
      addElement(
        {
          id: `${d.elementType}-${Date.now()}`,
          type: d.elementType,
          x: Math.max(0, dropX),
          y: Math.max(0, dropY),
          width: d.width,
          height: d.height,
          seats: d.seats,
        },
        alias,
      );
      return;
    }

    if (active.data.current?.type === "element") {
      if (over?.id === "palette-area" || over?.id === "guests-area") {
        showToast("No puedes mover el elemento fuera del plano.");
        return;
      }
      const delta = event.delta;
      if (delta.x !== 0 || delta.y !== 0) {
        const id = String(active.id).replace("element-", "");
        const element = useSeatingStore
          .getState()
          .elements.find((e) => e.id === id);
        if (element)
          updateElementPosition(
            id,
            element.x + delta.x / zoom,
            element.y + delta.y / zoom,
          );
      }
      return;
    }

    if (over?.data.current?.type === "table") {
      const tableId = String(over.id).replace("table-", "");
      const activeType = active.data.current?.type;
      const table = elements.find((e) => e.id === tableId);
      if (!table) return;

      if (table.seats === 0) {
        if (activeType === "guest" || activeType === "family") {
          showToast(
            "No puedes asignar invitados a elementos que no sean mesas.",
          );
        }
        return;
      }

      const availableSeats = table.seats - table.assignedSeats.length;

      if (activeType === "guest") {
        if (availableSeats <= 0) {
          showToast("No se pudo asignar. La mesa ya está llena.");
          return;
        }
        assignGuestToTable(tableId, String(active.id).replace("guest-", ""));
      } else if (activeType === "family") {
        const familyId = String(active.id).replace("family-", "");
        const family = useSeatingStore
          .getState()
          .families.find((f) => f.id === familyId);
        if (family) {
          if (availableSeats <= 0) {
            showToast("No se pudo asignar a la familia. La mesa está llena.");
            return;
          }
          const unassignedGuestsCount = family.guests.filter(
            (g) => !elements.some((el) => el.assignedSeats.includes(g.id)),
          ).length;
          if (unassignedGuestsCount > availableSeats)
            showToast(
              `Solo se asignaron ${availableSeats} lugares porque la mesa se llenó.`,
            );
          assignFamilyToTable(tableId, familyId);
        }
      }
    }
  };

  return (
    <div
      className="flex flex-row w-full overflow-hidden relative"
      style={{ height: "calc(100dvh - 4rem - 1px)" }}
    >
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className="flex flex-row shrink-0 transition-all duration-300"
          style={{ width: leftOpen ? "auto" : "0" }}
        >
          <aside
            className="shrink-0 bg-[#FDFBF7] border-r border-[#EBE5DA] overflow-hidden flex flex-col h-full"
            style={{
              transform: leftOpen ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 0.3s ease",
              position: leftOpen ? "relative" : "absolute",
              zIndex: leftOpen ? "auto" : -1,
            }}
          >
            <ElementsPalette onClose={() => setLeftOpen(false)} />
          </aside>
        </div>

        <div className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
          <button
            onClick={() => setLeftOpen((o) => !o)}
            className="absolute top-3 left-3 z-30 p-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-[#EBE5DA] rounded-xl shadow-sm hover:bg-[#F9F7F2] text-[#5A5A5A] transition-all hover:border-[#C5A669] hover:text-[#C5A669]"
          >
            {leftOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            <LayoutTemplate size={18} />
          </button>
          <button
            onClick={() => setRightOpen((o) => !o)}
            className="absolute top-3 right-3 z-30 p-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-[#EBE5DA] rounded-xl shadow-sm hover:bg-[#F9F7F2] text-[#5A5A5A] transition-all hover:border-[#C5A669] hover:text-[#C5A669]"
          >
            <Users size={18} />
            {rightOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
          <SeatingCanvas />
        </div>

        <div
          className="flex flex-row shrink-0 transition-all duration-300"
          style={{ width: rightOpen ? "auto" : "0" }}
        >
          <aside
            className="shrink-0 bg-[#FDFBF7] border-l border-[#EBE5DA] overflow-hidden flex flex-col h-full"
            style={{
              transform: rightOpen ? "translateX(0)" : "translateX(100%)",
              transition: "transform 0.3s ease",
              position: rightOpen ? "relative" : "absolute",
              right: 0,
              zIndex: rightOpen ? "auto" : -1,
            }}
          >
            <GuestAssignmentSidebar onClose={() => setRightOpen(false)} />
          </aside>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDragItem?.type === "palette_element" &&
          "label" in (activeDragItem.data || {}) ? (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border-2 border-[#C5A669] ring-2 ring-[#C5A669]/30 shadow-2xl pointer-events-none cursor-grabbing opacity-90">
              <span className="text-sm font-semibold text-[#2C2C29]">
                {
                  (
                    activeDragItem.data as Extract<
                      DragItemData,
                      { type: "palette_element" }
                    >
                  ).label
                }
              </span>
            </div>
          ) : activeDragItem?.type === "guest" &&
            "guest" in (activeDragItem.data || {}) ? (
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-[#C5A669] ring-2 ring-[#C5A669]/50 shadow-2xl scale-105 pointer-events-none cursor-grabbing text-xs">
              <GripVertical size={12} className="text-[#C5A669]" />
              <span className="flex-1 truncate font-medium text-[#2C2C29]">
                {(
                  activeDragItem.data as Extract<
                    DragItemData,
                    { type: "guest" }
                  >
                ).guest?.name || `Invitado`}
              </span>
            </div>
          ) : activeDragItem?.type === "family" &&
            "family" in (activeDragItem.data || {}) ? (
            <div className="p-2 bg-white border border-[#C5A669] ring-2 ring-[#C5A669]/50 shadow-2xl rounded-lg scale-105 pointer-events-none flex items-center gap-2 cursor-grabbing min-w-[180px]">
              <GripVertical size={14} className="text-[#C5A669]" />
              <span className="font-serif text-[13px] font-semibold text-[#2C2C29]">
                {
                  (
                    activeDragItem.data as Extract<
                      DragItemData,
                      { type: "family" }
                    >
                  ).family?.name
                }
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {toastMsg && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#2C2C29] text-white px-4 py-2.5 rounded-xl shadow-xl z-[100] flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <AlertCircle size={16} className="text-[#C5A669]" />
          <span className="text-sm font-medium tracking-wide">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
