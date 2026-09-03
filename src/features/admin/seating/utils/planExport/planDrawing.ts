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
  // ─── Mesas ──────────────────────────────────────────────
  round_table: { fill: "#DBEAFE", stroke: "#60A5FA", text: "#1E40AF" },
  rectangular_table: { fill: "#DBEAFE", stroke: "#60A5FA", text: "#1E40AF" },
  square_table: { fill: "#DBEAFE", stroke: "#60A5FA", text: "#1E40AF" },
  half_moon_table: { fill: "#DBEAFE", stroke: "#60A5FA", text: "#1E40AF" },
  cocktail_table: { fill: "#DBEAFE", stroke: "#60A5FA", text: "#1E40AF" },
  head_table: { fill: "#FEF3C7", stroke: "#F59E0B", text: "#B45309" },
  sweethearts_table: { fill: "#FCE7F3", stroke: "#C5A669", text: "#8B5A8C" },
  lounge_table: { fill: "#F5F3FF", stroke: "#A78BFA", text: "#5B21B6" },
  // ─── Estructurales ──────────────────────────────────────
  wall: { fill: "#EBE5DA", stroke: "#5A5A5A", text: "#2C2C29" },
  door: { fill: "#FDFBF7", stroke: "#A78B5C", text: "#7A6740" },
  window: { fill: "#E0F2FE", stroke: "#6B8DA8", text: "#3F6E8C" },
  column: { fill: "#EBE5DA", stroke: "#5A5A5A", text: "#2C2C29" },
  stairs: { fill: "#F5EFE3", stroke: "#9C7C5A", text: "#7A5C3F" },
  aisle: { fill: "#F9F7F2", stroke: "#C5A669", text: "#8B7340" },
  // ─── Servicios ──────────────────────────────────────────
  bathroom: { fill: "#DBEAFE", stroke: "#60A5FA", text: "#1E40AF" },
  kitchen: { fill: "#FFEDD5", stroke: "#FB923C", text: "#7C2D12" },
  emergency_exit: { fill: "#FEE2E2", stroke: "#F87171", text: "#991B1B" },
  check_in: { fill: "#CFFAFE", stroke: "#22D3EE", text: "#155E75" },
  // ─── Espacios (ex-Mobiliario) ──────────────────────────
  photo_booth: { fill: "#FCE7F3", stroke: "#F472B6", text: "#9D174D" },
  lounge: { fill: "#EDE9FE", stroke: "#A78BFA", text: "#5B21B6" },
  fountain: { fill: "#E0F2FE", stroke: "#38BDF8", text: "#075985" },
  plant: { fill: "#DCFCE7", stroke: "#4ADE80", text: "#166534" },
  // ─── Áreas / Espacios ───────────────────────────────────
  dance_floor: { fill: "#E0E7FF", stroke: "#6366F1", text: "#4338CA" },
  stage: { fill: "#FFE4E6", stroke: "#F43F5E", text: "#BE123C" },
  dj_booth: { fill: "#E0F2FE", stroke: "#0EA5E9", text: "#0369A1" },
  cake_area: { fill: "#FFE4E6", stroke: "#F43F5E", text: "#BE123C" },
  gift_table: { fill: "#DBEAFE", stroke: "#60A5FA", text: "#1E40AF" },
  drink_bar: { fill: "#DBEAFE", stroke: "#60A5FA", text: "#1E40AF" },
  buffet: { fill: "#DCFCE7", stroke: "#22C55E", text: "#15803D" },
  candy_bar: { fill: "#DBEAFE", stroke: "#60A5FA", text: "#1E40AF" },
  garden_entrance: { fill: "#DCFCE7", stroke: "#4ADE80", text: "#14532D" },
  bride_room: { fill: "#FCE7F3", stroke: "#F472B6", text: "#9D174D" },
  groom_room: { fill: "#FEF3C7", stroke: "#C5A669", text: "#92400E" },
  smoking_area: { fill: "#F4F4F5", stroke: "#A1A1AA", text: "#3F3F46" },
  // ─── Utilidades ─────────────────────────────────────────
  text_label: { fill: "transparent", stroke: "transparent", text: "#2C2C29" },
  line_divider: { fill: "transparent", stroke: "#C5A669", text: "#8B7340" },
  zone_shape: {
    fill: "rgba(197,166,105,0.06)",
    stroke: "#C5A669",
    text: "#5A5A5A",
  },
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
  "sweethearts_table",
]);

/** Radio de borde (px) para mesas/áreas no redondas, igual al editor (rounded-xl). */
const SHAPE_RADIUS = 12;

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
  const rotation = el.rotation ?? 0;

  ctx.save();

  // Aplicar rotación alrededor del centro del elemento
  if (rotation !== 0) {
    ctx.translate(el.width / 2, el.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-el.width / 2, -el.height / 2);
  }

  // Casos especiales: utilidades puras
  if (el.type === "text_label") {
    drawTextLabel(ctx, el);
    ctx.restore();
    return;
  }
  if (el.type === "line_divider") {
    drawLineDivider(ctx, el);
    ctx.restore();
    return;
  }
  if (el.type === "zone_shape") {
    drawZoneShape(ctx, el);
    if (el.width * scale > 60 && el.height * scale > 30) {
      drawLabel(ctx, el.width, el.height, el, false, colors.text, indexLabel);
    }
    ctx.restore();
    return;
  }

  // Forma del contenedor (mesas y áreas)
  drawShape(ctx, el.width, el.height, el.type, colors, isTable);

  // Label y capacidad (solo si el elemento es lo suficientemente grande)
  // Para mesa de novios se renderiza el label con tipografía especial
  if (el.width * scale > 60 && el.height * scale > 30) {
    if (el.type === "sweethearts_table") {
      drawSweetheartsLabel(ctx, el);
    } else {
      drawLabel(ctx, el.width, el.height, el, isTable, colors.text, indexLabel);
    }
  }

  // Sillas decorativas de la mesa de novios (afuera de la mesa)
  if (el.type === "sweethearts_table") {
    drawSweetheartsChairs(ctx, el);
  }

  // Asientos funcionales
  if (isTable && el.type !== "sweethearts_table") {
    if (el.type === "lounge_table") {
      drawLoungeTableSeats(dc, el, families);
    } else {
      drawSeats(dc, el, families);
    }
  }

  ctx.restore();
}

/**
 * Label de la mesa de novios con tipografía cursiva + subtítulo
 */
function drawSweetheartsLabel(
  ctx: CanvasRenderingContext2D,
  el: SeatingElement,
) {
  ctx.save();
  ctx.fillStyle = "#8B5A8C";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const aliasSize = Math.max(11, Math.min(18, el.width / 12));
  ctx.font = `italic bold ${aliasSize}px Georgia, serif`;
  ctx.fillText(
    el.alias || "Mesa de los Novios",
    el.width / 2,
    el.height / 2 - 6,
  );

  ctx.fillStyle = "#C5A669";
  ctx.font = "bold 9px sans-serif";
  ctx.fillText("MESA DE LOS NOVIOS", el.width / 2, el.height / 2 + 10);
  ctx.restore();
}

/**
 * Sillas decorativas de la mesa de novios (AFUERA de la mesa)
 */
function drawSweetheartsChairs(
  ctx: CanvasRenderingContext2D,
  el: SeatingElement,
) {
  const chairSize = Math.min(el.height * 0.4, 28);
  const cy = el.height / 2;

  // Silla izquierda (novia) - AFUERA
  drawSweetheartChair(
    ctx,
    -chairSize - 6,
    cy - chairSize / 2,
    chairSize,
    "#FCE7F3",
    "#F472B6",
    "#BE185D",
  );
  // Silla derecha (novio) - AFUERA
  drawSweetheartChair(
    ctx,
    el.width + 6,
    cy - chairSize / 2,
    chairSize,
    "#FEF3C7",
    "#C5A669",
    "#A78B5C",
  );
}

function drawSweetheartChair(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bg: string,
  border: string,
  textColor: string,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Corona (símbolo unicode)
  ctx.fillStyle = textColor;
  ctx.font = `bold ${size * 0.55}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("♔", x + size / 2, y + size / 2);
  ctx.restore();
}

/**
 * Asientos del lounge_table (mismo algoritmo y geometría que
 * TableShape.tsx):
 *  - Sillón (píldora horizontal) arriba con 2 plazas
 *  - Bancas laterales (verticales) con 2-3 plazas cada una
 *  - Poufs individuales debajo de la mesa
 *  - Todos los asientos son TableSeat de 28px
 */
function drawLoungeTableSeats(
  dc: DrawContext,
  el: SeatingElement,
  _families: FamilyElement[],
) {
  const { ctx } = dc;
  const w = el.width;
  const h = el.height;

  const padding = 12;
  const sofaW = 144;
  const sofaH = 64;
  const benchW = 48;
  const benchH = 144;
  const stoolSize = 28;
  const seatSize = 28;
  const seatRadius = seatSize / 2;

  // Mismo algoritmo de distribución que TableShape.tsx
  let topSofa = 0;
  let leftBench = 0;
  let rightBench = 0;
  let bottomStools = 0;

  if (el.seats === 1) bottomStools = 1;
  else if (el.seats === 2) topSofa = 2;
  else if (el.seats === 3) {
    topSofa = 2;
    bottomStools = 1;
  } else if (el.seats === 4) {
    topSofa = 2;
    leftBench = 2;
  } else if (el.seats === 5) {
    topSofa = 2;
    leftBench = 3;
  } else if (el.seats === 6) {
    topSofa = 2;
    leftBench = 2;
    rightBench = 2;
  } else if (el.seats === 7) {
    topSofa = 2;
    leftBench = 3;
    rightBench = 2;
  } else if (el.seats === 8) {
    topSofa = 2;
    leftBench = 3;
    rightBench = 3;
  } else if (el.seats > 8) {
    topSofa = 2;
    leftBench = 3;
    rightBench = 3;
    bottomStools = el.seats - 8;
  }

  const centerX = w / 2;
  const centerY = h / 2;

  const sofaX = centerX - sofaW / 2;
  const sofaY = padding;

  const benchInset = 28;
  const leftBenchX = padding + benchInset;
  const leftBenchY = centerY - benchH / 2;

  const rightBenchX = w - padding - benchW - benchInset;
  const rightBenchY = centerY - benchH / 2;

  const tableBottomEdge = centerY + 48;
  const stoolY = tableBottomEdge + 12;
  const stoolGap = 12;

  const getStoolXs = (count: number) => {
    const totalW = count * stoolSize + (count - 1) * stoolGap;
    const startX = centerX - totalW / 2;
    return Array.from(
      { length: count },
      (_, i) => startX + i * (stoolSize + stoolGap),
    );
  };
  const bottomStoolXs = getStoolXs(bottomStools);

  // ── Dibujar Sillón (píldora blanca con borde) ──
  if (topSofa > 0) {
    ctx.save();
    // Píldora completa (border-radius = sofaH/2)
    ctx.beginPath();
    const r = sofaH / 2;
    ctx.moveTo(sofaX + r, sofaY);
    ctx.lineTo(sofaX + sofaW - r, sofaY);
    ctx.arc(sofaX + sofaW - r, sofaY + r, r, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(sofaX + r, sofaY + sofaH);
    ctx.arc(sofaX + r, sofaY + r, r, Math.PI / 2, Math.PI * 1.5);
    ctx.closePath();
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.strokeStyle = "#D1D5DB";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 2 plazas (centradas con 16px de gap, +4px hacia abajo para
    // mejor presentación — mismo offset que TableShape.tsx)
    for (let i = 0; i < topSofa; i++) {
      const cx = sofaX + sofaW / 2 + (i === 0 ? -22 : 22);
      const cy = sofaY + sofaH / 2 + 4;
      ctx.beginPath();
      ctx.arc(cx, cy, seatRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#E5E7EB";
      ctx.fill();
      ctx.strokeStyle = "#9CA3AF";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  // ── Dibujar Banca Izquierda ──
  if (leftBench > 0) {
    ctx.save();
    ctx.beginPath();
    drawRoundedRect(ctx, leftBenchX, leftBenchY, benchW, benchH, 12);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.strokeStyle = "#D1D5DB";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    const spacing = benchH / (leftBench + 1);
    for (let i = 0; i < leftBench; i++) {
      const cx = leftBenchX + benchW / 2;
      const cy = leftBenchY + spacing * (i + 1);
      ctx.beginPath();
      ctx.arc(cx, cy, seatRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#E5E7EB";
      ctx.fill();
      ctx.strokeStyle = "#9CA3AF";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  // ── Dibujar Banca Derecha ──
  if (rightBench > 0) {
    ctx.save();
    ctx.beginPath();
    drawRoundedRect(ctx, rightBenchX, rightBenchY, benchW, benchH, 12);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.strokeStyle = "#D1D5DB";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    const spacing = benchH / (rightBench + 1);
    for (let i = 0; i < rightBench; i++) {
      const cx = rightBenchX + benchW / 2;
      const cy = rightBenchY + spacing * (i + 1);
      ctx.beginPath();
      ctx.arc(cx, cy, seatRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#E5E7EB";
      ctx.fill();
      ctx.strokeStyle = "#9CA3AF";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  // ── Dibujar Poufs (individuales debajo de la mesa) ──
  bottomStoolXs.forEach((x) => {
    ctx.beginPath();
    ctx.arc(
      x + stoolSize / 2,
      stoolY + stoolSize / 2,
      stoolSize / 2,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.strokeStyle = "#D1D5DB";
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

/**
 * Sillas decorativas para la mesa de novios: 2 círculos con íconos
 * distintivos (corazón para novia, corona para novio).
 */
function drawSweetheartsSeats(
  dc: DrawContext,
  el: SeatingElement,
  _families: FamilyElement[],
) {
  const { ctx } = dc;
  const seatSize = Math.min(el.width * 0.16, 28);
  const margin = Math.max(8, el.width * 0.06);

  const seatsData = [
    {
      x: margin,
      color: "#E11D48",
      bg: "#FCE7F3",
      border: "#F472B6",
      label: "N",
    },
    {
      x: el.width - margin - seatSize,
      color: "#A78B5C",
      bg: "#FEF3C7",
      border: "#C5A669",
      label: "H",
    },
  ];

  for (const seat of seatsData) {
    const cy = el.height / 2 - seatSize / 2;
    ctx.beginPath();
    ctx.arc(
      seat.x + seatSize / 2,
      cy + seatSize / 2,
      seatSize / 2,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = seat.bg;
    ctx.fill();
    ctx.strokeStyle = seat.border;
    ctx.lineWidth = 2;
    ctx.stroke();
    // Letra
    ctx.fillStyle = seat.color;
    ctx.font = `bold ${seatSize * 0.55}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(seat.label, seat.x + seatSize / 2, cy + seatSize / 2);
  }
}

/**
 * Renderiza un text_label: solo el texto centrado sobre fondo transparente.
 */
function drawTextLabel(ctx: CanvasRenderingContext2D, el: SeatingElement) {
  ctx.save();
  ctx.fillStyle = TYPE_COLORS.text_label.text;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fontSize = Math.max(10, Math.min(20, el.width / 8));
  ctx.font = `bold ${fontSize}px Georgia, serif`;
  ctx.fillText(el.alias || "Texto", el.width / 2, el.height / 2);
  ctx.restore();
}

/**
 * Renderiza un line_divider: línea horizontal dorada + label al medio.
 */
function drawLineDivider(ctx: CanvasRenderingContext2D, el: SeatingElement) {
  ctx.save();
  const y = el.height / 2;
  ctx.strokeStyle = TYPE_COLORS.line_divider.stroke;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(el.width, y);
  ctx.stroke();
  if (el.alias) {
    ctx.fillStyle = "#F9F7F2";
    const labelW = Math.min(el.width, ctx.measureText(el.alias).width + 12);
    ctx.fillRect(el.width / 2 - labelW / 2, y - 8, labelW, 16);
    ctx.fillStyle = TYPE_COLORS.line_divider.text;
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(el.alias, el.width / 2, y);
  }
  ctx.restore();
}

/**
 * Renderiza un zone_shape: rectángulo TRANSPARENTE con solo borde punteado.
 */
function drawZoneShape(ctx: CanvasRenderingContext2D, el: SeatingElement) {
  ctx.save();

  // Borde punteado
  ctx.strokeStyle = TYPE_COLORS.zone_shape.stroke;
  ctx.setLineDash([6, 4]);
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 0, 0, el.width, el.height, SHAPE_RADIUS);
  ctx.stroke();
  ctx.setLineDash([]);

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
  const isHalfMoon = type === "half_moon_table";
  const isColumn = type === "column";

  // Estructurales con renderizado especial
  if (type === "wall") {
    drawWall(ctx, w, h, colors);
    return;
  }
  if (type === "door") {
    drawDoor(ctx, w, h, colors);
    return;
  }
  if (type === "window") {
    drawWindow(ctx, w, h, colors);
    return;
  }
  if (isColumn) {
    drawColumn(ctx, w, h, colors);
    return;
  }
  if (type === "stairs") {
    drawStairs(ctx, w, h, colors);
    return;
  }
  if (type === "aisle") {
    drawAisle(ctx, w, h, colors);
    return;
  }

  if (type === "lounge_table") {
    // 1. Fondo de la zona Lounge
    drawRoundedRect(ctx, 0, 0, w, h, 24);
    ctx.fillStyle = colors.fill;
    ctx.fill();
    ctx.strokeStyle = colors.stroke;
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Mesa Central
    const tableW = Math.min(w * 0.6, 224);
    const tableH = Math.min(h * 0.4, 128);
    const tableX = (w - tableW) / 2;
    const tableY = (h - tableH) / 2;

    ctx.beginPath();
    drawRoundedRect(ctx, tableX, tableY, tableW, tableH, 24);
    ctx.fillStyle = "#FAF8F5"; // Fondo crema/madera
    ctx.fill();
    ctx.strokeStyle = "#D7C9B2";
    ctx.lineWidth = 2;
    ctx.stroke();
    return;
  }

  ctx.beginPath();
  if (isRound) {
    // Mesas redondas / cocteleras / sweethearts: círculo completo
    const r = Math.min(w, h) / 2;
    ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
  } else if (isHalfMoon) {
    // Media luna: borde inferior recto, arco semicircular arriba
    // (mismo path que TableShape.tsx → renderHalfMoonSvg)
    const r = w / 2;
    ctx.moveTo(0, h);
    ctx.lineTo(w, h);
    // sweep counterclockwise para ir por arriba
    ctx.arc(r, h, r, 0, Math.PI, true);
  } else {
    // Cuadradas, rectangulares, head_table, áreas: rounded-xl
    drawRoundedRect(ctx, 0, 0, w, h, SHAPE_RADIUS);
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

// ─────────────────────────────────────────────────────────────
// Dibujos especiales para elementos estructurales
// ─────────────────────────────────────────────────────────────

function drawWall(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  colors: { fill: string; stroke: string },
) {
  ctx.fillStyle = colors.fill;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, w, h);

  // Juntas horizontales
  ctx.strokeStyle = "#A8A29E";
  ctx.setLineDash([2, 1]);
  ctx.lineWidth = 0.75;
  for (let y = 8; y < h; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function drawDoor(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  colors: { fill: string; stroke: string },
) {
  // Marco inferior (línea gruesa)
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(w, h);
  ctx.stroke();

  // Hoja de puerta (línea diagonal)
  const hingeX = 4;
  const hingeY = h - 2;
  const radius = Math.min(w - 8, h - 4);
  ctx.strokeStyle = "#A78B5C";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(hingeX, hingeY);
  ctx.lineTo(hingeX + radius * 0.95, hingeY - radius * 0.95);
  ctx.stroke();

  // Arco de apertura (punteado)
  ctx.setLineDash([3, 2]);
  ctx.beginPath();
  ctx.arc(hingeX, hingeY, radius, -Math.PI / 2, 0, true);
  ctx.stroke();
  ctx.setLineDash([]);

  // Bisagra
  ctx.fillStyle = colors.stroke;
  ctx.beginPath();
  ctx.arc(hingeX, hingeY, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawWindow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  colors: { fill: string; stroke: string },
) {
  ctx.fillStyle = "#E0F2FE";
  ctx.fillRect(2, 2, w - 4, h - 4);
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, w - 4, h - 4);

  // Dos líneas paralelas internas
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(6, h / 2 - 1.5);
  ctx.lineTo(w - 6, h / 2 - 1.5);
  ctx.moveTo(6, h / 2 + 1.5);
  ctx.lineTo(w - 6, h / 2 + 1.5);
  ctx.stroke();
}

function drawColumn(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  colors: { fill: string; stroke: string },
) {
  const size = Math.min(w, h);
  const cx = w / 2;
  const cy = h / 2;
  const half = size / 2;

  ctx.fillStyle = colors.fill;
  ctx.fillRect(cx - half + 1, cy - half + 1, size - 2, size - 2);
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - half + 1, cy - half + 1, size - 2, size - 2);

  // Círculos concéntricos
  ctx.strokeStyle = "#A8A29E";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, half * 0.7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, half * 0.4, 0, Math.PI * 2);
  ctx.stroke();

  // Punto central
  ctx.fillStyle = colors.stroke;
  ctx.beginPath();
  ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawStairs(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  colors: { fill: string; stroke: string },
) {
  ctx.fillStyle = colors.fill;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, w, h);

  // Líneas paralelas horizontales (escalones)
  const stepCount = Math.max(3, Math.floor(h / 8));
  const stepH = h / stepCount;
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = 1;
  for (let i = 1; i < stepCount; i++) {
    const y = i * stepH;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Flecha de subida
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(w / 2, h - 6);
  ctx.lineTo(w / 2, 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w / 2 - 4, 10);
  ctx.lineTo(w / 2, 4);
  ctx.lineTo(w / 2 + 4, 10);
  ctx.stroke();
}

function drawAisle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  colors: { fill: string; stroke: string },
) {
  ctx.fillStyle = colors.fill;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, 0, w, h);

  // Línea central punteada
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * Rectángulo con esquinas redondeadas. Usa `ctx.roundRect()` si está
 * disponible (Chrome 99+, Safari 16+, Firefox 113+); si no, hace
 * fallback a un path manual.
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  type WithRoundRect = CanvasRenderingContext2D & {
    roundRect?: (
      x: number,
      y: number,
      w: number,
      h: number,
      radii: number | number[],
    ) => void;
  };
  const c = ctx as WithRoundRect;
  if (typeof c.roundRect === "function") {
    c.roundRect(x, y, w, h, r);
    return;
  }
  // Fallback: path manual con curvas cuadráticas
  const radius = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
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
      else if (edge === 1) positions.push({ x: width + offset, y: offsetXY });
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

export function buildGuestIndex(
  families: FamilyElement[],
): Map<
  string,
  { family: FamilyElement; guest: FamilyElement["guests"][number] }
> {
  const map = new Map<
    string,
    { family: FamilyElement; guest: FamilyElement["guests"][number] }
  >();
  for (const f of families) {
    for (const g of f.guests) {
      if (g.id) map.set(g.id, { family: f, guest: g });
    }
  }
  return map;
}
