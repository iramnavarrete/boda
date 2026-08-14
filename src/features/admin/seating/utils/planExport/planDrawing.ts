import { SeatingElement, ElementType, FamilyElement } from "@/types/seating";

/**
 * Funciones puras para dibujar el plano de mesas en un Canvas 2D.
 *
 * Reciben un contexto ya posicionado donde la mesa/área va a (0, 0) con su
 * width/height final, y se encargan de pintar la forma + label + capacidad
 * + los asientos (si es mesa).
 *
 * Estas funciones NO usan el DOM, así que no hay problemas de cross-origin
 * ni estilos externos.
 */

export interface DrawContext {
  ctx: CanvasRenderingContext2D;
  scale: number; // factor de escala (1 = píxeles del mundo, > 1 = más grande)
}

// Paleta de colores por tipo de elemento (sincronizada con global.css)
const TYPE_COLORS: Record<
  ElementType,
  { fill: string; stroke: string; text: string }
> = {
  round_table: { fill: "#DBEAFE", stroke: "#60A5FA", text: "#1E40AF" },
  rectangular_table: { fill: "#DBEAFE", stroke: "#60A5FA", text: "#1E40AF" },
  square_table: { fill: "#DBEAFE", stroke: "#60A5FA", text: "#1E40AF" },
  half_moon_table: { fill: "#DBEAFE", stroke: "#60A5FA", text: "#1E40AF" },
  cocktail_table: { fill: "#DBEAFE", stroke: "#60A5FA", text: "#1E40AF" },
  head_table: { fill: "#FEF3C7", stroke: "#F59E0B", text: "#B45309" },
  dance_floor: { fill: "#E0E7FF", stroke: "#6366F1", text: "#4338CA" },
  stage: { fill: "#FFE4E6", stroke: "#F43F5E", text: "#BE123C" },
  dj_booth: { fill: "#E0F2FE", stroke: "#0EA5E9", text: "#0369A1" },
  cake_area: { fill: "#FFE4E6", stroke: "#F43F5E", text: "#BE123C" },
  gift_table: { fill: "#DBEAFE", stroke: "#60A5FA", text: "#1E40AF" },
  drink_bar: { fill: "#DBEAFE", stroke: "#60A5FA", text: "#1E40AF" },
  buffet: { fill: "#DCFCE7", stroke: "#22C55E", text: "#15803D" },
  candy_bar: { fill: "#DBEAFE", stroke: "#60A5FA", text: "#1E40AF" },
};

const STATUS_COLORS = {
  confirmed: "#22C55E",
  declined: "#EF4444",
  pending: "#F59E0B",
  empty: "#A8A29E",
};

const ROUND_TYPES: ReadonlySet<ElementType> = new Set([
  "round_table",
  "cocktail_table",
]);

/**
 * Dibuja un elemento del plano (mesa o área) en el contexto.
 * El origen (0,0) está en la esquina superior izquierda del elemento.
 */
export function drawElement(
  dc: DrawContext,
  el: SeatingElement,
  families: FamilyElement[],
  indexLabel?: number,
) {
  const { ctx, scale } = dc;
  const isTable = el.seats > 0;
  const colors = TYPE_COLORS[el.type];

  ctx.save();
  ctx.translate(0, 0);

  // Forma del contenedor
  drawShape(ctx, el.width, el.height, el.type, colors, isTable);

  // Label y capacidad (solo si el elemento es lo suficientemente grande)
  if (el.width * scale > 60 && el.height * scale > 30) {
    drawLabel(ctx, el.width, el.height, el, isTable, colors.text, indexLabel);
  }

  // Asientos
  if (isTable) {
    drawSeats(dc, el, families);
  }

  ctx.restore();
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  type: ElementType,
  colors: { fill: string; stroke: string },
  isTable: boolean,
) {
  const isRound = ROUND_TYPES.has(type);

  ctx.beginPath();
  if (isRound) {
    const r = Math.min(w, h) / 2;
    ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
  } else {
    ctx.rect(0, 0, w, h);
  }
  ctx.closePath();

  ctx.fillStyle = colors.fill;
  ctx.fill();

  ctx.strokeStyle = colors.stroke;
  // Áreas: borde discontinuo. Mesas: sólido.
  if (isTable) {
    ctx.setLineDash([]);
    ctx.lineWidth = 3;
  } else {
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 2;
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  el: SeatingElement,
  isTable: boolean,
  textColor: string,
  indexLabel?: number,
) {
  const isRound = ROUND_TYPES.has(el.type);

  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Calcular font size basado en el ancho del elemento
  const baseFontSize = Math.max(8, Math.min(16, w / 8));
  ctx.font = `bold ${baseFontSize}px Georgia, serif`;

  if (isRound) {
    ctx.fillText(el.alias, w / 2, h / 2);
  } else {
    ctx.fillText(el.alias, w / 2, h / 2);
  }
}

function drawSeats(
  dc: DrawContext,
  el: SeatingElement,
  families: FamilyElement[],
) {
  const { ctx, scale } = dc;

  // Index de guestId -> family + guest
  const guestIndex = buildGuestIndex(families);

  const seatRadius = Math.max(6, Math.min(14, 14 * (scale / 1)));
  const seatOffset = 22 * scale; // distancia del centro de la mesa al centro del asiento

  const positions = computeSeatPositions(el, seatOffset);

  for (let i = 0; i < positions.length; i++) {
    const { x, y } = positions[i];
    const guestId = el.assignedSeats[i];
    const info = guestId ? guestIndex.get(guestId) : undefined;

    let bg = "#EBECEF";
    let border = "#A8AEBA";
    let textColor = "#A8A29E";

    if (info) {
      bg = info.family.colorBg;
      border = info.family.colorBorder;
      textColor = "#2C2C29";
    }

    // Círculo del asiento
    ctx.beginPath();
    ctx.arc(x, y, seatRadius, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = border;
    ctx.lineWidth = Math.max(1, 2 * (scale / 2));
    ctx.stroke();

    // Número de asiento
    if (seatRadius > 8) {
      ctx.fillStyle = textColor;
      ctx.font = `bold ${Math.max(7, seatRadius * 0.85)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(i + 1), x, y);
    }
  }
}

interface Point {
  x: number;
  y: number;
}

export function computeSeatPositions(
  el: SeatingElement,
  offset: number,
): Point[] {
  const { type, width, height, seats } = el;
  const positions: Point[] = [];

  if (type === "round_table" || type === "cocktail_table") {
    const radius = width / 2 + offset;
    for (let i = 0; i < seats; i++) {
      const angle = ((i * 360) / seats - 90) * (Math.PI / 180);
      positions.push({
        x: width / 2 + radius * Math.cos(angle),
        y: height / 2 + radius * Math.sin(angle),
      });
    }
  } else if (type === "half_moon_table") {
    const radius = width / 2 + offset;
    for (let i = 0; i < seats; i++) {
      const angle =
        (-180 + (i * 180) / Math.max(seats - 1, 1)) * (Math.PI / 180);
      positions.push({
        x: width / 2 + radius * Math.cos(angle),
        y: height / 2 + radius * Math.sin(angle),
      });
    }
  } else if (type === "square_table") {
    const seatsPerEdge = Math.ceil(seats / 4);
    const spacing = width / (seatsPerEdge + 1);
    for (let i = 0; i < seats; i++) {
      const edge = Math.floor(i / seatsPerEdge);
      const pos = i % seatsPerEdge;
      const offsetXY = spacing * (pos + 1);
      if (edge === 0) positions.push({ x: offsetXY, y: -offset });
      else if (edge === 1)
        positions.push({ x: width + offset, y: offsetXY });
      else if (edge === 2) positions.push({ x: offsetXY, y: height + offset });
      else positions.push({ x: -offset, y: offsetXY });
    }
  } else if (type === "rectangular_table") {
    const topSeats = Math.ceil(seats / 2);
    const spacing = width / (topSeats + 1);
    for (let i = 0; i < seats; i++) {
      if (i < topSeats) {
        positions.push({ x: spacing * (i + 1), y: -offset });
      } else {
        const bottom = i - topSeats;
        const count = seats - topSeats;
        const s = width / (count + 1);
        positions.push({ x: s * (bottom + 1), y: height + offset });
      }
    }
  } else if (type === "head_table") {
    const spacing = width / (seats + 1);
    for (let i = 0; i < seats; i++) {
      positions.push({ x: spacing * (i + 1), y: height + offset });
    }
  }

  return positions;
}

export function buildGuestIndex(families: FamilyElement[]): Map<
  string,
  { family: FamilyElement; guest: FamilyElement["guests"][number] }
> {
  const map = new Map<string, { family: FamilyElement; guest: FamilyElement["guests"][number] }>();
  for (const f of families) {
    for (const g of f.guests) {
      if (g.id) map.set(g.id, { family: f, guest: g });
    }
  }
  return map;
}
