import React, { useRef } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { SeatingElement, useSeatingStore } from "./stores/useSeatingStore";
import { Trash2, Users, RotateCcw } from "lucide-react";
import {
  Music,
  MonitorUp,
  MonitorPlay,
  Cake,
  Gift,
  Wine,
  UtensilsCrossed,
  Candy,
} from "lucide-react";

const AREA_ICONS: Record<string, any> = {
  dance_floor: Music,
  stage: MonitorUp,
  dj_booth: MonitorPlay,
  cake_area: Cake,
  gift_table: Gift,
  drink_bar: Wine,
  buffet: UtensilsCrossed,
  candy_bar: Candy,
};

function SettingsPopover({
  element,
  isTable,
  onClose,
}: {
  element: SeatingElement;
  isTable: boolean;
  onClose: () => void;
}) {
  const {
    updateElementSeats,
    updateElementAlias,
    removeElement,
    removeGuestFromTable,
    families,
  } = useSeatingStore();

  const assignedGuests = element.assignedSeats
    .map((gid) => {
      for (const f of families) {
        const g = f.guests.find((gu) => gu.id === gid);
        if (g) {
          const index = f.guests.findIndex((gu) => gu.id === gid);
          return { ...g, familyName: f.name, index };
        }
      }
      return null;
    })
    .filter(Boolean);

  return (
    <div
      className="settings-popover absolute z-50"
      style={{
        bottom: "calc(100% + 14px)",
        left: "50%",
        transform: "translateX(-50%)",
        width: "280px",
        filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.18))",
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Arrow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-[#EBE5DA] rotate-45"
        style={{ bottom: -5, zIndex: 1 }}
      />

      <div className="bg-white rounded-2xl border border-[#EBE5DA] overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-[#EBE5DA] bg-[#FDFBF7]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <label className="block text-[9px] text-[#A8A29E] uppercase font-bold tracking-widest mb-1.5">
                Nombre / Alias
              </label>
              <input
                value={element.alias}
                onChange={(e) => updateElementAlias(element.id, e.target.value)}
                className="w-full text-sm font-semibold text-[#2C2C29] bg-white border border-[#EBE5DA] rounded-lg px-3 py-2 focus:border-[#C5A669] focus:outline-none transition-colors placeholder:text-[#A8A29E]"
                placeholder="Nombre de mesa"
              />
            </div>
            <button
              onClick={() => {
                removeElement(element.id);
                onClose();
              }}
              className="mt-5 p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-200 shrink-0"
              title="Eliminar elemento"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Seats slider */}
        {isTable && (
          <div className="px-4 py-3 border-b border-[#EBE5DA]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[9px] text-[#A8A29E] uppercase font-bold tracking-widest flex items-center gap-1.5">
                <Users size={11} />
                Asientos
              </label>
              <span className="text-sm font-bold text-[#2C2C29] bg-[#F9F7F2] border border-[#EBE5DA] px-2.5 py-0.5 rounded-lg min-w-[36px] text-center">
                {element.seats}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#A8A29E] font-bold w-3">
                1
              </span>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={element.seats}
                onChange={(e) =>
                  updateElementSeats(element.id, parseInt(e.target.value))
                }
                className="flex-1 accent-[#C5A669] h-1.5 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #C5A669 0%, #C5A669 ${((element.seats - 1) / 29) * 100}%, #EBE5DA ${((element.seats - 1) / 29) * 100}%, #EBE5DA 100%)`,
                }}
              />
              <span className="text-[10px] text-[#A8A29E] font-bold w-5">
                30
              </span>
            </div>

            {/* Seat occupancy bar */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#EBE5DA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C5A669] rounded-full transition-all"
                  style={{
                    width: `${Math.min((element.assignedSeats.length / element.seats) * 100, 100)}%`,
                  }}
                />
              </div>
              <span className="text-[10px] font-bold text-[#5A5A5A] shrink-0">
                {element.assignedSeats.length}/{element.seats} ocupados
              </span>
            </div>
          </div>
        )}

        {/* Assigned guests list */}
        {isTable && assignedGuests.length > 0 && (
          <div className="px-4 py-3 max-h-[140px] overflow-y-auto">
            <label className="block text-[9px] text-[#A8A29E] uppercase font-bold tracking-widest mb-2">
              Asientos asignados
            </label>
            <div className="space-y-1.5">
              {assignedGuests.map((g: any, i) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between gap-2 py-1 px-2 rounded-lg bg-[#F9F7F2] group/seat"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-[#dbeafe] border border-[#93c5fd] flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-[#1e40af]">
                        {i + 1}
                      </span>
                    </div>
                    <span className="text-xs text-[#2C2C29] font-medium truncate">
                      {g.name || `${g.familyName} #${g.index + 1}`}
                    </span>
                  </div>
                  <button
                    onClick={() => removeGuestFromTable(element.id, g.id)}
                    className="p-1 opacity-0 group-hover/seat:opacity-100 transition-opacity hover:bg-red-50 text-red-400 rounded"
                    title="Quitar de la mesa"
                  >
                    <RotateCcw size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TableElement({ element }: { element: SeatingElement }) {
  const {
    zoom,
    selectedElementId,
    setSelectedElementId,
    updateElementSeats,
    updateElementAlias,
    families,
    removeElement,
  } = useSeatingStore();
  const isSelected = selectedElementId === element.id;
  const isTable = element.seats !== undefined && element.seats > 0;

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: `table-${element.id}`,
    data: { type: "table" },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `element-${element.id}`,
    data: { type: "element" },
  });

  const setNodeRef = (node: HTMLElement | null) => {
    setDroppableRef(node);
    setDraggableRef(node);
  };

  const getGuestInfo = (id: string) => {
    for (const f of families) {
      const g = f.guests.find((guest) => guest.id === id);
      if (g) {
        const index = f.guests.findIndex((gu) => gu.id === id);
        return { ...g, familyName: f.name, index };
      }
    }
    return null;
  };

  const renderSeats = () => {
    if (!isTable) return null;
    const seats = [];

    for (let i = 0; i < element.seats; i++) {
      let x = 0,
        y = 0;
      let angleDegrees = 0;

      if (element.type === "round_table" || element.type === "cocktail_table") {
        angleDegrees = (i * 360) / element.seats;
        const radius = element.width / 2 + 26;
        x =
          element.width / 2 +
          radius * Math.cos((angleDegrees - 90) * (Math.PI / 180));
        y =
          element.height / 2 +
          radius * Math.sin((angleDegrees - 90) * (Math.PI / 180));
      } else if (element.type === "half_moon_table") {
        // Seats arc along the flat bottom (semicircle facing up)
        // The flat edge is at y=0, the curved part goes up (negative y)
        // So we spread seats in a 180° arc on the curved side (top)
        angleDegrees = -180 + (i * 180) / Math.max(element.seats - 1, 1);
        const radius = element.width / 2 + 22;
        x =
          element.width / 2 + radius * Math.cos(angleDegrees * (Math.PI / 180));
        y =
          element.height / 2 +
          radius * Math.sin(angleDegrees * (Math.PI / 180));
      } else if (element.type === "square_table") {
        const seatsPerEdge = Math.ceil(element.seats / 4);
        const edge = Math.floor(i / seatsPerEdge);
        const posInEdge = i % seatsPerEdge;
        const spacing = element.width / (seatsPerEdge + 1);
        const offset = spacing * (posInEdge + 1);
        if (edge === 0) {
          x = offset;
          y = -22;
          angleDegrees = 0;
        } else if (edge === 1) {
          x = element.width + 22;
          y = offset;
          angleDegrees = 90;
        } else if (edge === 2) {
          x = offset;
          y = element.height + 22;
          angleDegrees = 180;
        } else {
          x = -22;
          y = offset;
          angleDegrees = 270;
        }
      } else if (element.type === "rectangular_table") {
        const topSeats = Math.ceil(element.seats / 2);
        const isTop = i < topSeats;
        const index = isTop ? i : i - topSeats;
        const count = isTop ? topSeats : element.seats - topSeats;
        const spacing = element.width / (count + 1);
        x = spacing * (index + 1);
        y = isTop ? -22 : element.height + 22;
        angleDegrees = isTop ? 0 : 180;
      } else if (element.type === "head_table") {
        const spacing = element.width / (element.seats + 1);
        x = spacing * (i + 1);
        y = element.height + 22;
        angleDegrees = 180;
      }

      const assignedGuestId = element.assignedSeats[i];
      const guestInfo = assignedGuestId ? getGuestInfo(assignedGuestId) : null;
      const isAssigned = !!assignedGuestId;
      const circleBg = isAssigned ? "#90CAF9" : "#EBECEF";
      const circleBorder = isAssigned ? "#1E88E5" : "#A8AEBA";

      let labelText = "";
      if (guestInfo) {
        labelText =
          guestInfo.name || `${guestInfo.familyName} #${guestInfo.index + 1}`;
      }

      const normAngle = ((angleDegrees % 360) + 360) % 360;
      let labelPositionClass = "";
      if (normAngle >= 315 || normAngle < 45)
        labelPositionClass = "bottom-full mb-1.5 left-1/2 -translate-x-1/2";
      else if (normAngle >= 45 && normAngle < 135)
        labelPositionClass = "left-full ml-1.5 top-1/2 -translate-y-1/2";
      else if (normAngle >= 135 && normAngle < 225)
        labelPositionClass = "top-full mt-1.5 left-1/2 -translate-x-1/2";
      else labelPositionClass = "right-full mr-1.5 top-1/2 -translate-y-1/2";

      seats.push(
        <div
          key={i}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-0 w-7 h-7 flex items-center justify-center"
          style={{ left: x, top: y, opacity: isDragging ? 0.3 : 1 }}
        >
          <div
            className="w-full h-full rounded-full border-2 shadow-sm relative transition-colors duration-200"
            style={{ backgroundColor: circleBg, borderColor: circleBorder }}
          >
            {isAssigned && (
              <div
                className={`absolute ${labelPositionClass} whitespace-nowrap bg-[#eff6ff] text-[#1e40af] border border-[#93c5fd] px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm cursor-default`}
              >
                {labelText}
              </div>
            )}
          </div>
        </div>,
      );
    }
    return seats;
  };

  const getAreaStyles = () => {
    switch (element.type) {
      case "stage":
      case "cake_area":
        return { bg: "#ffe4e6", border: "#f43f5e", text: "#be123c" };
      case "dance_floor":
        return { bg: "#e0e7ff", border: "#6366f1", text: "#4338ca" };
      case "dj_booth":
        return { bg: "#e0f2fe", border: "#0ea5e9", text: "#0369a1" };
      case "buffet":
        return { bg: "#dcfce7", border: "#22c55e", text: "#15803d" };
      case "head_table":
        return { bg: "#fef3c7", border: "#f59e0b", text: "#b45309" };
      default:
        return {
          bg: "#dbeafe",
          border: isSelected ? "#2563eb" : "#60a5fa",
          text: "#1e40af",
        };
    }
  };

  const areaStyle = getAreaStyles();
  const isArea = !isTable;
  const AreaIcon = AREA_ICONS[element.type];

  // Shape rendering
  const isCircular =
    element.type === "round_table" || element.type === "cocktail_table";
  const isHalfMoon = element.type === "half_moon_table";

  // For half-moon: render as SVG semicircle
  const renderHalfMoonShape = () => {
    const w = element.width;
    const h = element.height; // half the circle's full diameter
    const r = w / 2;
    // Path: start at bottom-left, line to bottom-right, arc back to bottom-left (upper semicircle)
    const pathD = `M 0 ${h} L ${w} ${h} A ${r} ${r} 0 0 0 0 ${h} Z`;

    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${w} ${h}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        <path
          d={pathD}
          fill={isOver ? "#eff6ff" : areaStyle.bg}
          stroke={
            isOver ? "#2563eb" : isSelected ? "#C5A669" : areaStyle.border
          }
          strokeWidth={isSelected ? 3 : 2.5}
          strokeDasharray={isArea ? "6 4" : undefined}
        />
      </svg>
    );
  };

  let borderRadiusClass = "rounded-xl";
  if (isCircular) borderRadiusClass = "rounded-full";

  return (
    <div
      ref={setNodeRef}
      className={`absolute table-element-card ${isDragging ? "z-50" : "z-10"}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: transform
          ? `translate3d(${transform.x / zoom}px, ${transform.y / zoom}px, 0)`
          : undefined,
        touchAction: "none",
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElementId(isSelected ? null : element.id);
      }}
    >
      {/* Settings popover */}
      {isSelected && (
        <SettingsPopover
          element={element}
          isTable={isTable}
          onClose={() => setSelectedElementId(null)}
        />
      )}

      {/* Seat circles */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ overflow: "visible" }}
      >
        {renderSeats()}
      </div>

      {/* Half-moon special rendering */}
      {isHalfMoon && (
        <div
          className={`absolute inset-0 ${isDragging ? "opacity-80" : "opacity-100"} ${isOver ? "scale-[1.02]" : ""}`}
          style={{ transition: "transform 0.15s" }}
        >
          {renderHalfMoonShape()}
          {/* Label in center of the semicircle */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ paddingBottom: element.height * 0.3 }}
          >
            <div className="text-center">
              <span
                className="block font-serif font-bold text-[1rem]"
                style={{ color: areaStyle.text }}
              >
                {element.alias}
              </span>
              {isTable && (
                <span
                  className="block text-[11px] font-bold tracking-widest uppercase mt-0.5"
                  style={{ color: areaStyle.border, opacity: 0.8 }}
                >
                  {element.assignedSeats.length}/{element.seats}
                </span>
              )}
            </div>
          </div>
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{ background: "transparent" }}
          />
        </div>
      )}

      {/* Normal shape (non-half-moon) */}
      {!isHalfMoon && (
        <div
          {...attributes}
          {...listeners}
          className={`absolute inset-0 flex flex-col items-center justify-center shadow-sm cursor-grab active:cursor-grabbing transition-transform
            ${isArea ? "border-2 border-dashed" : "border-[3px]"}
            ${borderRadiusClass}
            ${isOver ? "ring-4 ring-[#2563eb]/30 scale-[1.02]" : ""}
            ${isDragging ? "opacity-80 shadow-2xl scale-[1.03]" : "opacity-100"}
            ${isSelected ? "!border-[#C5A669] shadow-md ring-2 ring-[#C5A669]/20" : ""}
          `}
          style={{
            backgroundColor: isOver
              ? isTable
                ? "#eff6ff"
                : "#FDFBF7"
              : areaStyle.bg,
            borderColor: isSelected
              ? "#C5A669"
              : isOver
                ? "#2563eb"
                : areaStyle.border,
          }}
        >
          {isArea && AreaIcon && (
            <div
              className="absolute top-2 left-2"
              style={{ color: areaStyle.text }}
            >
              <AreaIcon size={20} strokeWidth={2} />
            </div>
          )}

          <div className="text-center px-4 w-full">
            <span
              className={`block font-serif truncate w-full ${isArea ? "font-bold opacity-90" : "font-bold text-[#1e3a8a]"}`}
              style={
                isArea
                  ? { color: areaStyle.text, fontSize: "1.1rem" }
                  : { fontSize: "1rem" }
              }
            >
              {element.alias}
            </span>
            {isTable && (
              <span className="block text-[11px] font-bold tracking-widest uppercase text-[#3b82f6] mt-0.5 opacity-80">
                {element.assignedSeats.length}/{element.seats}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
