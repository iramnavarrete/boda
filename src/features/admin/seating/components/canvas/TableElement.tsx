import React, { useRef } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { SeatingElement, useSeatingStore } from "../../stores/useSeatingStore";
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
import { TableSettingsPopover } from "./TableSettingsPopover";
import { TableSeat } from "./TableSeat";

const AREA_ICONS: Record<string, React.ElementType> = {
  dance_floor: Music,
  stage: MonitorUp,
  dj_booth: MonitorPlay,
  cake_area: Cake,
  gift_table: Gift,
  drink_bar: Wine,
  buffet: UtensilsCrossed,
  candy_bar: Candy,
};

export default function TableElement({ element }: { element: SeatingElement }) {
  const {
    zoom,
    selectedElementId,
    selectedElementIds,
    setSelectedElementId,
    families,
    updateElementGeometry,
  } = useSeatingStore();

  const isSingleSelected = selectedElementId === element.id;
  const isSelectedInBulk = selectedElementIds?.includes(element.id) ?? false;
  const isSelected = isSingleSelected || isSelectedInBulk;

  const isTable = element.seats !== undefined && element.seats > 0;
  const isArea = !isTable;

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

  const resizeState = useRef<{
    x: number;
    y: number;
    w: number;
    h: number;
    posX: number;
    posY: number;
    corner: string;
  } | null>(null);

  const onPointerDownResize = (
    e: React.PointerEvent<HTMLDivElement>,
    corner: string,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    resizeState.current = {
      x: e.clientX,
      y: e.clientY,
      w: element.width,
      h: element.height,
      posX: element.x,
      posY: element.y,
      corner,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMoveResize = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!resizeState.current) return;
    const { x, y, w, h, posX, posY, corner } = resizeState.current;

    const dx = (e.clientX - x) / zoom;
    const dy = (e.clientY - y) / zoom;

    const MIN_SIZE = 60;
    const MAX_SIZE = 1500;

    let newW = w;
    let newH = h;
    let newX = posX;
    let newY = posY;

    if (corner.includes("left")) {
      newW = Math.max(MIN_SIZE, Math.min(MAX_SIZE, w - dx));
      newX = posX + (w - newW);
    } else if (corner.includes("right")) {
      newW = Math.max(MIN_SIZE, Math.min(MAX_SIZE, w + dx));
    }

    if (corner.includes("top")) {
      newH = Math.max(MIN_SIZE, Math.min(MAX_SIZE, h - dy));
      newY = posY + (h - newH);
    } else if (corner.includes("bottom")) {
      newH = Math.max(MIN_SIZE, Math.min(MAX_SIZE, h + dy));
    }

    updateElementGeometry(element.id, newW, newH, newX, newY);
  };

  const onPointerUpResize = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!resizeState.current) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    resizeState.current = null;
  };

  const renderResizeHandles = () => {
    if (!isSingleSelected || !isArea) return null; // Solo mostramos tiradores en selección única

    const handles = [
      {
        id: "top-left",
        style: { top: -8, left: -8 },
        cursor: "cursor-nw-resize",
      },
      {
        id: "top-right",
        style: { top: -8, right: -8 },
        cursor: "cursor-ne-resize",
      },
      {
        id: "bottom-left",
        style: { bottom: -8, left: -8 },
        cursor: "cursor-sw-resize",
      },
      {
        id: "bottom-right",
        style: { bottom: -8, right: -8 },
        cursor: "cursor-se-resize",
      },
    ];

    return handles.map((h) => (
      <div
        key={h.id}
        className={`absolute w-4 h-4 bg-white border-[2.5px] border-[#C5A669] rounded-full z-[60] shadow-md hover:scale-125 transition-transform ${h.cursor}`}
        style={h.style}
        onPointerDown={(e) => onPointerDownResize(e, h.id)}
        onPointerMove={onPointerMoveResize}
        onPointerUp={onPointerUpResize}
        onPointerCancel={onPointerUpResize}
      />
    ));
  };

  const getGuestInfo = (id: string) => {
    for (const f of families) {
      const g = f.guests.find((guest) => guest.id === id);
      if (g) {
        return {
          ...g,
          familyColorBg: f.colorBg,
          familyColorBorder: f.colorBorder,
          familyName: f.name,
          index: f.guests.findIndex((gu) => gu.id === id),
        };
      }
    }
    return null;
  };

  const renderSeats = () => {
    if (!isTable) return null;
    const seats = [];

    for (let i = 0; i < element.seats; i++) {
      let x = 0,
        y = 0,
        angleDegrees = 0;

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

      seats.push(
        <TableSeat
          key={i}
          x={x}
          y={y}
          isDragging={isDragging}
          isAssigned={isAssigned}
          seatNumber={i + 1}
          guestName={
            guestInfo
              ? guestInfo.name ||
                `${guestInfo.familyName} #${guestInfo.index + 1}`
              : undefined
          }
          status={guestInfo?.status}
          colorBg={guestInfo?.familyColorBg}
          colorBorder={guestInfo?.familyColorBorder}
          tableId={element.id}
          guestId={assignedGuestId}
        />,
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
  const AreaIcon = AREA_ICONS[element.type];

  const isCircular =
    element.type === "round_table" || element.type === "cocktail_table";
  const isHalfMoon = element.type === "half_moon_table";

  const renderHalfMoonShape = () => {
    const w = element.width;
    const h = element.height;
    const r = w / 2;
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
      className={`absolute table-element-card ${
        isDragging ? "z-[70]" : isSelected ? "z-[60]" : "z-10"
      }`}
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
        setSelectedElementId(isSingleSelected ? null : element.id);
      }}
    >
      {isSingleSelected && (
        <TableSettingsPopover
          element={element}
          isTable={isTable}
          onClose={() => setSelectedElementId(null)}
        />
      )}

      {renderResizeHandles()}

      <div
        className={`absolute inset-0 pointer-events-none ${isHalfMoon ? 'top-8' : ''}`}
        style={{ overflow: "visible" }}
      >
        {renderSeats()}
      </div>

      {isHalfMoon && (
        <div
          className={`absolute inset-0 ${
            isDragging ? "opacity-80" : "opacity-100"
          } ${isOver ? "scale-[1.02]" : ""}`}
          style={{ transition: "transform 0.15s" }}
        >
          {renderHalfMoonShape()}
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
          <div
            {...attributes}
            {...listeners}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{ background: "transparent" }}
          />
        </div>
      )}

      {!isHalfMoon && (
        <div
          {...attributes}
          {...listeners}
          className={`absolute inset-0 flex flex-col items-center justify-center shadow-sm cursor-grab active:cursor-grabbing transition-colors
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
              className={`block font-serif truncate w-full ${
                isArea ? "font-bold opacity-90" : "font-bold text-[#1e3a8a]"
              }`}
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
