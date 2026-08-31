import React from "react";
import { ChessKing, ChessQueen } from "lucide-react";
import { ElementType, TableShapeProps } from "@/types/seating";

/**
 * Renderiza la forma de las MESAS (incluyendo la mesa de novios).
 *
 * Para áreas y elementos NO estructurales, ver `AreaShape`.
 * Para elementos estructurales, ver `StructuralElementShape`.
 *
 * La forma exterior y la posición de las sillas dependen de `type`.
 * El alias se centra en la mesa y la capacidad se muestra debajo.
 */
export function TableShape({
  type,
  width,
  height,
  seatsCount = 0,
  alias,
  assignedSeatsCount = 0,
  renderSeatItem,
  seatPosition = "top",
}: TableShapeProps) {
  const isTable = seatsCount > 0;
  const isHalfMoon = type === "half_moon_table";
  const isSweethearts = type === "sweethearts_table";
  const isLounge = type === "lounge";

  const renderSeats = () => {
    if (!isTable || isSweethearts || isLounge) {
      // Para sweethearts y lounge las sillas se renderizan aparte
      return null;
    }
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

  // ───────────────────────────────────────────────────────────
  // LOUNGE: item especial con sillonsitos y bancos circulares
  // Layout fijo: sofá horizontal (6) + 2 sillones verticales (2) + 2 bancos (2) = 10
  // Los muebles se dibujan con CSS puro, los asientos son TableSeat funcionales
  // ───────────────────────────────────────────────────────────
  if (isLounge) {
    return (
      <div
        className="relative w-full h-full"
        style={{ overflow: "visible" }}
      >
        {/* Asientos funcionales posicionados sobre el layout */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ overflow: "visible" }}
        >
          {renderSeatItem &&
            (() => {
              // Posiciones fijas del lounge:
              //  - Sofá horizontal abajo (capacidad 6)
              //  - Sillón vertical izquierdo (capacidad 2)
              //  - Sillón vertical derecho (capacidad 2)
              //  - 2 bancos circulares (1 cada uno, capacidad 1)
              // El layout está en el CSS (.lounge-*) — estas posiciones
              // corresponden a los centros de los asientos en el mueble.
              const seatPositions: { x: number; y: number }[] = [
                // Sofá horizontal (6 asientos en línea)
                { x: width * 0.20, y: height - 18 },
                { x: width * 0.32, y: height - 18 },
                { x: width * 0.44, y: height - 18 },
                { x: width * 0.56, y: height - 18 },
                { x: width * 0.68, y: height - 18 },
                { x: width * 0.80, y: height - 18 },
                // Sillón vertical izquierdo (2 asientos)
                { x: 18, y: height * 0.35 },
                { x: 18, y: height * 0.65 },
                // Sillón vertical derecho (2 asientos)
                { x: width - 18, y: height * 0.35 },
                { x: width - 18, y: height * 0.65 },
              ];

              // Solo renderizamos hasta seatsCount
              return seatPositions
                .slice(0, seatsCount)
                .map((pos, idx) => renderSeatItem(idx, pos));
            })()}
        </div>

        <div className="table-element-inner lounge-inner w-full h-full flex items-center justify-center relative">
          <span className="block font-serif truncate w-full element-alias px-4">
            {alias}
          </span>
          {seatsCount > 0 && (
            <span className="absolute bottom-1 right-2 text-[9px] font-bold tracking-widest uppercase text-[#5A5A5A] opacity-60">
              {assignedSeatsCount}/{seatsCount}
            </span>
          )}
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // MESA DE NOVIOS: mesa con 2 sillas decorativas ARRIBA
  // Las sillas son decorativas (no asignables) y se renderizan como
  // elementos JSX para poder usar iconos de lucide-react
  // (ChessQueen para la novia, ChessKing para el novio).
  // ───────────────────────────────────────────────────────────
  if (isSweethearts) {
    // Para la mesa de novios, las sillas decorativas pueden ir arriba
    // o abajo según `seatPosition` (default "top").
    // "top"    → top negativo, las sillas sobresalen por encima de la mesa
    // "bottom" → top = height + 6, las sillas sobresalen por debajo
    const chairTop = seatPosition === "bottom" ? height + 6 : -54;

    return (
      <div
        className="relative w-full h-full sweethearts-wrapper"
        style={{ overflow: "visible" }}
      >
        {/* Silla decorativa IZQUIERDA — Novia (ChessQueen) */}
        <div
          className="absolute flex items-center justify-center rounded-full shadow-md pointer-events-none"
          style={{
            top: chairTop,
            left: "calc(50% - 52px)",
            width: 48,
            height: 48,
            backgroundColor: "#FCE7F3",
            border: "2.5px solid #F472B6",
            zIndex: 3,
          }}
          aria-hidden
        >
          <ChessQueen
            size={28}
            strokeWidth={2}
            color="#BE185D"
          />
        </div>

        {/* Silla decorativa DERECHA — Novio (ChessKing) */}
        <div
          className="absolute flex items-center justify-center rounded-full shadow-md pointer-events-none"
          style={{
            top: chairTop,
            right: "calc(50% - 52px)",
            width: 48,
            height: 48,
            backgroundColor: "#FEF3C7",
            border: "2.5px solid #C5A669",
            zIndex: 3,
          }}
          aria-hidden
        >
          <ChessKing
            size={28}
            strokeWidth={2}
            color="#A78B5C"
          />
        </div>

        <div className="table-element-inner sweethearts-table w-full h-full flex items-center justify-center relative">
          <div className="text-center px-4 w-full">
            {alias && (
              <span className="block font-serif text-[1.05rem] element-alias">
                {alias}
              </span>
            )}
            <span className="block text-[9px] font-bold tracking-widest uppercase mt-0.5 element-capacity opacity-70">
              Mesa de los Novios
            </span>
          </div>
        </div>
      </div>
    );
  }

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
