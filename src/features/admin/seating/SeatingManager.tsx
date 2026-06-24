import React, { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { useSeatingStore } from "./stores/useSeatingStore";
import ElementsPalette from "./ElementsPalette";
import GuestAssignmentSidebar from "./GuestAssignmentSidebar";
import SeatingCanvas from "./SeatingCanvas";
import {
  GripVertical,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";

export default function SeatingManager() {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const {
    updateElementPosition,
    assignGuestToTable,
    assignFamilyToTable,
    addElement,
    elements,
    zoom,
    canvasOffset,
  } = useSeatingStore();

  // Sidebar visibility — works same on both desktop and mobile
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const [activeDragItem, setActiveDragItem] = useState<{
    id: string;
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
  } | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem({
      id: String(event.active.id),
      type: event.active.data.current?.type,
      data: event.active.data.current,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = event;

    // --- Drop palette element onto canvas ---
    if (active.data.current?.type === "palette_element") {
      const isOverCanvas =
        over?.id === "canvas" ||
        over?.data.current?.type === "canvas" ||
        !over?.data.current?.type;

      if (isOverCanvas || over === null) {
        const d = active.data.current;
        const count =
          elements.filter((e) => e.type === d.elementType).length + 1;
        const isTable = d.seats > 0;
        const alias = isTable ? `Mesa ${count}` : d.label;

        // Calculate drop position in canvas world coords
        // Try to place in visible center area of canvas
        const canvasEl = document.querySelector(".canvas-droppable-area");
        let dropX = 400;
        let dropY = 300;

        if (canvasEl) {
          const containerEl = canvasEl.closest(
            ".overflow-hidden",
          ) as HTMLElement;
          if (containerEl) {
            const rect = containerEl.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const offset = canvasOffset ?? { x: 0, y: 0 };
            dropX = (centerX - offset.x) / zoom - d.width / 2;
            dropY = (centerY - offset.y) / zoom - d.height / 2;
          }
        }

        addElement(
          {
            id: `${d.elementType}-${Date.now()}`,
            type: d.elementType,
            x: Math.max(20, dropX),
            y: Math.max(20, dropY),
            width: d.width,
            height: d.height,
            seats: d.seats,
          },
          alias,
        );
      }
      return;
    }

    // --- Move element on canvas ---
    if (active.data.current?.type === "element") {
      const delta = event.delta;
      if (delta.x !== 0 || delta.y !== 0) {
        const id = String(active.id).replace("element-", "");
        const element = useSeatingStore
          .getState()
          .elements.find((e) => e.id === id);
        if (element) {
          updateElementPosition(
            id,
            element.x + delta.x / zoom,
            element.y + delta.y / zoom,
          );
        }
      }
      return;
    }

    // --- Assign guest/family to table ---
    if (over?.data.current?.type === "table") {
      const tableId = String(over.id).replace("table-", "");
      const activeType = active.data.current?.type;

      if (activeType === "guest") {
        assignGuestToTable(tableId, String(active.id).replace("guest-", ""));
      } else if (activeType === "family") {
        assignFamilyToTable(tableId, String(active.id).replace("family-", ""));
      }
    }
  };

  return (
    <div
      className="flex flex-row w-full overflow-hidden"
      style={{ height: "calc(100dvh - 4rem)" }}
    >
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* ── Left Sidebar: Palette ── */}
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
              pointerEvents: leftOpen ? "auto" : "none",
            }}
          >
            <ElementsPalette onClose={() => setLeftOpen(false)} />
          </aside>
        </div>

        {/* ── Center: Canvas + toggle buttons ── */}
        <div className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
          {/* Left toggle button */}
          <button
            onClick={() => setLeftOpen((o) => !o)}
            className="absolute top-3 left-3 z-30 p-2 bg-white/90 backdrop-blur-sm border border-[#EBE5DA] rounded-xl shadow-sm hover:bg-[#F9F7F2] text-[#5A5A5A] transition-all hover:border-[#C5A669] hover:text-[#C5A669]"
            title={leftOpen ? "Ocultar elementos" : "Mostrar elementos"}
          >
            {leftOpen ? (
              <PanelLeftClose size={16} />
            ) : (
              <PanelLeftOpen size={16} />
            )}
          </button>

          {/* Right toggle button */}
          <button
            onClick={() => setRightOpen((o) => !o)}
            className="absolute top-3 right-3 z-30 p-2 bg-white/90 backdrop-blur-sm border border-[#EBE5DA] rounded-xl shadow-sm hover:bg-[#F9F7F2] text-[#5A5A5A] transition-all hover:border-[#C5A669] hover:text-[#C5A669]"
            title={rightOpen ? "Ocultar invitados" : "Mostrar invitados"}
          >
            {rightOpen ? (
              <PanelRightClose size={16} />
            ) : (
              <PanelRightOpen size={16} />
            )}
          </button>

          <SeatingCanvas />
        </div>

        {/* ── Right Sidebar: Guests ── */}
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
              pointerEvents: rightOpen ? "auto" : "none",
            }}
          >
            <GuestAssignmentSidebar onClose={() => setRightOpen(false)} />
          </aside>
        </div>

        {/* Global Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeDragItem?.type === "palette_element" ? (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border-2 border-[#C5A669] ring-2 ring-[#C5A669]/30 shadow-2xl pointer-events-none cursor-grabbing opacity-90">
              <span className="text-sm font-semibold text-[#2C2C29]">
                {activeDragItem.data?.label}
              </span>
              {activeDragItem.data?.seats > 0 && (
                <span className="text-[10px] font-bold text-[#C5A669] uppercase tracking-wider">
                  {activeDragItem.data.seats} lugares
                </span>
              )}
            </div>
          ) : activeDragItem?.type === "guest" && activeDragItem.data?.guest ? (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#C5A669] ring-2 ring-[#C5A669]/50 shadow-2xl scale-105 pointer-events-none cursor-grabbing text-sm">
              <GripVertical size={14} className="text-[#C5A669]" />
              <span className="flex-1 truncate font-medium text-[#2C2C29]">
                {activeDragItem.data.guest.name ||
                  `${activeDragItem.data.guest.familyName || "Invitado"} #${(activeDragItem.data.guest.index ?? 0) + 1}`}
              </span>
            </div>
          ) : activeDragItem?.type === "family" &&
            activeDragItem.data?.family ? (
            <div className="p-3 bg-white border border-[#C5A669] ring-2 ring-[#C5A669]/50 shadow-2xl rounded-xl scale-105 pointer-events-none flex items-center gap-2 cursor-grabbing min-w-[200px]">
              <GripVertical size={16} className="text-[#C5A669]" />
              <span className="font-serif text-[15px] font-semibold text-[#2C2C29]">
                {activeDragItem.data.family.name}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
