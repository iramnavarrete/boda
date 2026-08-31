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
  const isLoungeTable = type === "lounge_table";

  const renderSeats = () => {
    if (!isTable || isSweethearts || isLoungeTable) {
      // Para sweethearts y lounge_table las sillas se renderizan aparte
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
  // LOUNGE_TABLE: mesa tipo sala de estar.
  //  - Contenedor gris tenue con borde punteado y esquinas
  //    redondeadas (el "tapete" del lounge).
  //  - Mesa central con el SVG del Sofa + alias.
  //  - Sillón (píldora horizontal) arriba con 2 plazas adentro.
  //  - Bancas laterales (verticales) a izquierda/derecha con 2-3 plazas.
  //  - Poufs individuales abajo de la mesa.
  //  - TODOS los asientos son TableSeat de 28px (mismo tamaño que
  //    las mesas regulares) → tooltip, drag y status funcionan
  //    idéntico.
  //  - Los muebles son divs simples con `pointer-events-none`, los
  //    TableSeats adentro tienen `pointer-events-auto` (reciben
  //    los eventos de tooltip, drag, etc.).
  // ───────────────────────────────────────────────────────────
  if (isLoungeTable) {
    const padding = 12;

    // Todos los asientos del lounge son del mismo tamaño que los
    // de las mesas regulares (28px). Hay espacio de sobra en el
    // sillón (144x64) y en las bancas (48x144).

    // Dimensiones de los muebles
    const sofaW = 144;
    const sofaH = 64;
    const benchW = 48;
    const benchH = 144;
    const stoolSize = 28; // poufs = mismo tamaño que los asientos
    const stoolGap = 12;

    // Distribución perimetral:
    //  N=1           → 1 pouf
    //  N=2           → 2 sillón
    //  N=3           → 2 sillón + 1 pouf
    //  N=4           → 2 sillón + 2 banca izq
    //  N=5           → 2 sillón + 3 banca izq
    //  N=6           → 2 sillón + 2 izq + 2 der
    //  N=7           → 2 sillón + 3 izq + 2 der
    //  N=8 (default) → 2 sillón + 3 izq + 3 der
    //  N>8           → 2 sillón + 3 izq + 3 der + (N-8) poufs
    const layout = (() => {
      let topSofa = 0;
      let leftBench = 0;
      let rightBench = 0;
      let bottomStools = 0;

      if (seatsCount === 1) bottomStools = 1;
      else if (seatsCount === 2) topSofa = 2;
      else if (seatsCount === 3) {
        topSofa = 2;
        bottomStools = 1;
      } else if (seatsCount === 4) {
        topSofa = 2;
        leftBench = 2;
      } else if (seatsCount === 5) {
        topSofa = 2;
        leftBench = 3;
      } else if (seatsCount === 6) {
        topSofa = 2;
        leftBench = 2;
        rightBench = 2;
      } else if (seatsCount === 7) {
        topSofa = 2;
        leftBench = 3;
        rightBench = 2;
      } else if (seatsCount === 8) {
        topSofa = 2;
        leftBench = 3;
        rightBench = 3;
      } else if (seatsCount > 8) {
        topSofa = 2;
        leftBench = 3;
        rightBench = 3;
        bottomStools = seatsCount - 8;
      }
      return { topSofa, leftBench, rightBench, bottomStools };
    })();

    const centerX = width / 2;
    const centerY = height / 2;

    // Coordenadas de los muebles
    const sofaX = centerX - sofaW / 2;
    const sofaY = padding;

    const benchInset = 28;
    const leftBenchX = padding + benchInset;
    const leftBenchY = centerY - benchH / 2;

    const rightBenchX = width - padding - benchW - benchInset;
    const rightBenchY = centerY - benchH / 2;

    // Poufs debajo de la mesa central
    const tableBottomEdge = centerY + 48;
    const stoolY = tableBottomEdge + 12;

    const getStoolXs = (count: number) => {
      const totalW = count * stoolSize + (count - 1) * stoolGap;
      const startX = centerX - totalW / 2;
      return Array.from(
        { length: count },
        (_, i) => startX + i * (stoolSize + stoolGap),
      );
    };
    const bottomStoolXs = getStoolXs(layout.bottomStools);

    // Numeración de plazas (orden: sillón → banca izq → banca der → poufs)
    let seatIdx = 0;
    const sofaSeats = Array.from({ length: layout.topSofa }, () => seatIdx++);
    const leftSeats = Array.from({ length: layout.leftBench }, () => seatIdx++);
    const rightSeats = Array.from(
      { length: layout.rightBench },
      () => seatIdx++,
    );
    const bottomSeats = Array.from(
      { length: layout.bottomStools },
      () => seatIdx++,
    );

    // Posiciones de los 2 asientos del sillón (centrados horizontalmente
    // con 16px de gap, y un poco más abajo del centro vertical para
    // mejor presentación — se asientan sobre la base del sofá en
    // lugar de quedar flotando en la mitad).
    // Sillón: 144x64, 2 seats de 28px → total 72, padding 36 a cada lado
    // Centros en x: 50 y 94. Centro vertical: 32 (+ offset 4 = 36)
    const sofaSeatPositions = [
      { x: sofaW / 2 - 22, y: sofaH / 2 + 4 }, // asiento 1
      { x: sofaW / 2 + 22, y: sofaH / 2 + 4 }, // asiento 2
    ];

    return (
      <div
        className="lounge-wrapper relative w-full h-full bg-slate-50/70 border-2 border-dashed border-slate-300 rounded-3xl shadow-sm"
        style={{ overflow: "visible" }}
      >
        {/* ── MESA CENTRAL — sin ícono, con alias + count ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center justify-center w-48 h-24 bg-gradient-to-br from-[#FAF8F5] to-[#EBE5DA] border-2 border-[#D7C9B2] rounded-[1rem] shadow-sm backdrop-blur-sm">
            {alias && (
              <span className="font-serif text-[13px] font-bold text-[#7A6740] tracking-wide">
                {alias || "Lounge"}
              </span>
            )}
            {isTable && (
              <span
                className="block text-[11px] font-bold tracking-widest uppercase mt-0.5 element-capacity"
                style={{ color: "#8B7250" }}
              >
                {assignedSeatsCount}/{seatsCount}
              </span>
            )}
          </div>
        </div>

        {/* ── SILLÓN (Superior) — solo el SVG decorativo (sin óvalo
            detrás). El SVG ya dibuja el sofá completo con sus paths
            (cojines + respaldo). `pointer-events-none` para no
            bloquear los TableSeats que están ENCIMA con z-20. ── */}
        {layout.topSofa > 0 && (
          <div
            className="absolute"
            style={{ left: sofaX, top: sofaY, width: sofaW, height: sofaH }}
          >
            <svg
              viewBox="0 0 144 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <path
                d="M 72 16 L 24 16 A 8 8 0 0 0 16 24 L 16 48 A 8 8 0 0 0 24 56 L 72 56 Z"
                fill="#FFFFFF"
                stroke="#D1D5DB"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M 72 16 L 120 16 A 8 8 0 0 1 128 24 L 128 48 A 8 8 0 0 1 120 56 L 72 56 Z"
                fill="#FFFFFF"
                stroke="#D1D5DB"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M 16 56 A 6 6 0 0 1 4 56 L 4 24 A 20 20 0 0 1 24 4 L 120 4 A 20 20 0 0 1 140 24 L 140 56 A 6 6 0 0 1 128 56 L 128 24 A 8 8 0 0 0 120 16 L 24 16 A 8 8 0 0 0 16 24 Z"
                fill="#F3F4F6"
                stroke="#D1D5DB"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            {/* TableSeats: absolute, z-20, capturan pointer events */}
            {renderSeatItem &&
              sofaSeats.map((seatId, i) =>
                renderSeatItem(seatId, {
                  ...sofaSeatPositions[i],
                }),
              )}
          </div>
        )}

        {/* ── BANCA IZQUIERDA ── */}
        {layout.leftBench > 0 && (
          <div
            className="absolute bg-white border-2 border-gray-300 rounded-xl shadow-md pointer-events-none"
            style={{
              left: leftBenchX,
              top: leftBenchY,
              width: benchW,
              height: benchH,
            }}
          >
            {renderSeatItem &&
              leftSeats.map((seatId, i) => {
                const spacing = benchH / (layout.leftBench + 1);
                return renderSeatItem(seatId, {
                  x: benchW / 2,
                  y: spacing * (i + 1),
                });
              })}
          </div>
        )}

        {/* ── BANCA DERECHA ── */}
        {layout.rightBench > 0 && (
          <div
            className="absolute bg-white border-2 border-gray-300 rounded-xl shadow-md pointer-events-none"
            style={{
              left: rightBenchX,
              top: rightBenchY,
              width: benchW,
              height: benchH,
            }}
          >
            {renderSeatItem &&
              rightSeats.map((seatId, i) => {
                const spacing = benchH / (layout.rightBench + 1);
                return renderSeatItem(seatId, {
                  x: benchW / 2,
                  y: spacing * (i + 1),
                });
              })}
          </div>
        )}

        {/* ── POUFS INDIVIDUALES (Debajo de la mesa) ── */}
        {bottomStoolXs.map((x, i) =>
          renderSeatItem?.(bottomSeats[i], {
            x: x + stoolSize / 2,
            y: stoolY + stoolSize / 2,
          }),
        )}
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
          <ChessQueen size={28} strokeWidth={2} color="#BE185D" />
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
          <ChessKing size={28} strokeWidth={2} color="#A78B5C" />
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
