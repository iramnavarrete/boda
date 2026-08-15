import React from "react";
import { ElementType } from "@/types/seating";

export interface TableShapeProps {
  type: ElementType;
  width: number;
  height: number;
  seatsCount?: number;
  alias?: string;
  assignedSeatsCount?: number;
  renderSeatItem?: (
    seatIndex: number,
    coords: { x: number; y: number },
  ) => React.ReactNode;
}

export function TableShape({
  type,
  width,
  height,
  seatsCount = 0,
  alias,
  assignedSeatsCount = 0,
  renderSeatItem,
}: TableShapeProps) {
  const isTable = seatsCount > 0;
  const isHalfMoon = type === "half_moon_table";

  const renderSeats = () => {
    if (!isTable) return null;
    const seats = [];

    for (let i = 0; i < seatsCount; i++) {
      let x = 0;
      let y = 0;

      if (type === "round_table" || type === "cocktail_table") {
        const angleDegrees = (i * 360) / seatsCount;
        const radius = width / 2 + 26;
        x =
          width / 2 + radius * Math.cos((angleDegrees - 90) * (Math.PI / 180));
        y =
          height / 2 + radius * Math.sin((angleDegrees - 90) * (Math.PI / 180));
      } else if (type === "half_moon_table") {
        const angleDegrees = -180 + (i * 180) / Math.max(seatsCount - 1, 1);
        const radius = width / 2 + 22;
        x = width / 2 + radius * Math.cos(angleDegrees * (Math.PI / 180));
        y = height / 2 + radius * Math.sin(angleDegrees * (Math.PI / 180));
      } else if (type === "square_table") {
        const seatsPerEdge = Math.ceil(seatsCount / 4);
        const edge = Math.floor(i / seatsPerEdge);
        const posInEdge = i % seatsPerEdge;
        const spacing = width / (seatsPerEdge + 1);
        const offset = spacing * (posInEdge + 1);
        if (edge === 0) {
          x = offset;
          y = -22;
        } else if (edge === 1) {
          x = width + 22;
          y = offset;
        } else if (edge === 2) {
          x = offset;
          y = height + 22;
        } else {
          x = -22;
          y = offset;
        }
      } else if (type === "rectangular_table") {
        const topSeats = Math.ceil(seatsCount / 2);
        const isTop = i < topSeats;
        const index = isTop ? i : i - topSeats;
        const count = isTop ? topSeats : seatsCount - topSeats;
        const spacing = width / (count + 1);
        x = spacing * (index + 1);
        y = isTop ? -22 : height + 22;
      } else if (type === "head_table") {
        const spacing = width / (seatsCount + 1);
        x = spacing * (i + 1);
        y = height + 22;
      }

      if (renderSeatItem) {
        seats.push(renderSeatItem(i, { x, y }));
      } else {
        seats.push(
          <div
            key={i}
            className="absolute w-6 h-6 rounded-full border-2 border-[#A8AEBA] bg-[#EBECEF] shadow-sm flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
            style={{ left: x, top: y }}
          >
            <span className="text-[9px] font-bold text-[#A8A29E] select-none">
              {i + 1}
            </span>
          </div>,
        );
      }
    }

    return seats;
  };

  const renderHalfMoonSvg = () => {
    const r = width / 2;
    const pathD = `M 0 ${height} L ${width} ${height} A ${r} ${r} 0 0 0 0 ${height} Z`;

    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: "visible" }}
      >
        <path d={pathD} strokeDasharray={!isTable ? "6 4" : undefined} />
      </svg>
    );
  };

  return (
    <div className="relative w-full h-full" style={{ overflow: "visible" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ overflow: "visible" }}
      >
        {renderSeats()}
      </div>

      {isHalfMoon ? (
        <div className="half-moon-content w-full h-full relative">
          {renderHalfMoonSvg()}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ paddingBottom: height * 0.3 }}
          >
            <div className="text-center">
              {alias && (
                <span className="block font-serif font-bold text-[1rem] element-alias">
                  {alias}
                </span>
              )}
              {isTable && (
                <span className="block text-[11px] font-bold tracking-widest uppercase mt-0.5 element-capacity">
                  {assignedSeatsCount}/{seatsCount}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="table-element-inner w-full h-full flex items-center justify-center">
          <div className="text-center px-4 w-full">
            {alias && (
              <span className="block font-serif truncate w-full element-alias">
                {alias}
              </span>
            )}
            {isTable && (
              <span className="block text-[11px] font-bold tracking-widest uppercase mt-0.5 element-capacity">
                {assignedSeatsCount}/{seatsCount}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
