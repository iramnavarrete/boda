import { saveAs } from "file-saver";
import { SeatingElement, FamilyElement } from "@/types/seating";
import { buildGuestIndex } from "./planDrawing";
import { capturePlanCanvas, CapturedPlan } from "./planCapture";

export interface ImageExportOptions {
  invitationName: string;
  elements: SeatingElement[];
  families: FamilyElement[];
  /**
   * (Deprecado) Se conserva por compatibilidad con la firma del hook.
   * El plano se renderiza a tamaño natural (zoom=1) en el canvas de
   * captura, así que el zoom del editor ya no se usa.
   */
  zoom?: number;
}

const ACCENT = "#C5A669";
const ACCENT_DARK = "#A08040";
const PAGE_BG = "#FFFFFF";
const CARD_BG = "#FFFFFF";
const CARD_BORDER = "#C5A669";
const TEXT_DARK = "#2C2C29";
const TEXT_MUTED = "#5A5A5A";
const TEXT_FAINT = "#A8A29E";
const EMPTY_SEAT = "#EBECEF";
const EMPTY_BORDER = "#A8AEBA";

/**
 * Factor de escala global del canvas final. 2x = calidad de impresión
 * (≈ 300 DPI), archivo de ~5-10 MB para un plano típico.
 */
const RENDER_SCALE = 2;

const TITLE_H = 200;
const PADDING = 50;
const CARD_W = 460;
const CARD_GAP_X = 24;
const CARD_GAP_Y = 24;
const CARD_PAD = 22;
const SEAT_CIRCLE_D = 26;
const SEAT_ROW_H = 40;

const COLS_PER_SIDE = 4;

/**
 * Render del plano + tarjetas a alta resolución.
 *
 * El canvas final se crea a `TOTAL_W * RENDER_SCALE` y se le aplica
 * `ctx.scale(RENDER_SCALE)`, así todo el código de dibujo sigue usando
 * coords del "mundo" pero el PNG final tiene el doble de pixeles.
 *
 * El plano se captura a 2.5x (en planCapture) y luego se dibuja en el
 * canvas final, así el resultado es un downscale (no upscale) → nítido.
 */
export async function exportPlanToImage(opts: ImageExportOptions) {
  const { invitationName, elements, families } = opts;

  // 1) Renderizar el plano a alta resolución (2.5x por defecto)
  const captured = await capturePlanCanvas(elements, families, {
    dpi: 300,
    pixelRatio: 2.5,
  });

  // 2) Render del layout final (título + plano capturado + tarjetas)
  const layoutBytes = await renderLayout(
    invitationName,
    captured,
    elements,
    families,
  );

  const fileName = `plano-mesas-${slugify(invitationName)}.png`;
  saveAs(new Blob([layoutBytes], { type: "image/png" }), fileName);
}

async function renderLayout(
  invitationName: string,
  planCapture: CapturedPlan,
  elements: SeatingElement[],
  families: FamilyElement[],
): Promise<Uint8Array> {
  const tables = elements.filter((e) => e.seats > 0);
  const guestIndex = buildGuestIndex(families);

  const sortedTables = [...tables].sort((a, b) => {
    const an = parseInt(a.alias.replace(/\D/g, ""), 10);
    const bn = parseInt(b.alias.replace(/\D/g, ""), 10);
    if (!isNaN(an) && !isNaN(bn) && an !== bn) return an - bn;
    return a.alias.localeCompare(b.alias);
  });

  // Distribución: 4 cols por lado
  const N = sortedTables.length;
  const SLOTS_PER_ROW = COLS_PER_SIDE * 2;

  let rowsPerSide = 0;
  let leftTables: SeatingElement[] = [];
  let rightTables: SeatingElement[] = [];
  let bottomTables: SeatingElement[] = [];

  if (N > 0) {
    const r = Math.ceil(N / SLOTS_PER_ROW);
    const overflowOnRFloor = N - (r - 1) * SLOTS_PER_ROW;

    if (overflowOnRFloor === SLOTS_PER_ROW) {
      rowsPerSide = r;
      const sideHalf = N / 2;
      leftTables = sortedTables.slice(0, sideHalf);
      rightTables = sortedTables.slice(sideHalf);
      bottomTables = [];
    } else {
      rowsPerSide = r - 1;
      if (rowsPerSide < 1) {
        rowsPerSide = 0;
        const half = Math.ceil(N / 2);
        leftTables = sortedTables.slice(0, half);
        rightTables = sortedTables.slice(half);
      } else {
        const sideTotal = rowsPerSide * SLOTS_PER_ROW;
        const sideHalf = sideTotal / 2;
        leftTables = sortedTables.slice(0, sideHalf);
        rightTables = sortedTables.slice(sideHalf, sideTotal);
        bottomTables = sortedTables.slice(sideTotal);
      }
    }
  }

  // Calcular altura de cada tarjeta
  function cardHeightFor(table: SeatingElement): number {
    const rowsInCard = Math.ceil(table.seats / 2);
    return 30 + 38 + 16 + rowsInCard * SEAT_ROW_H + 22;
  }

  function computeRowHeights(tablesList: SeatingElement[]): number[] {
    if (tablesList.length === 0) return [];
    const perCol = Math.ceil(tablesList.length / COLS_PER_SIDE);
    const rowHeights: number[] = [];
    for (let r = 0; r < perCol; r++) {
      let maxH = 0;
      for (let c = 0; c < COLS_PER_SIDE; c++) {
        const idx = r * COLS_PER_SIDE + c;
        if (idx < tablesList.length) {
          const h = cardHeightFor(tablesList[idx]);
          if (h > maxH) maxH = h;
        }
      }
      rowHeights.push(maxH);
    }
    return rowHeights;
  }

  const leftRowHeights = computeRowHeights(leftTables);
  const rightRowHeights = computeRowHeights(rightTables);
  const bottomRowHeights = computeRowHeights(bottomTables);

  function totalStackHeight(rowHeights: number[]): number {
    return (
      rowHeights.reduce((a, b) => a + b, 0) +
      Math.max(0, rowHeights.length - 1) * CARD_GAP_Y
    );
  }

  const sideTotalH = Math.max(
    totalStackHeight(leftRowHeights),
    totalStackHeight(rightRowHeights),
  );
  const bottomTotalH = totalStackHeight(bottomRowHeights);

  // Dimensiones del canvas (en coords del "mundo")
  const sideCardW =
    COLS_PER_SIDE * CARD_W + (COLS_PER_SIDE - 1) * CARD_GAP_X;
  const sideAreaW = sideCardW + PADDING * 2;

  // El plano capturado tiene su aspect ratio. Lo escalamos para que su
  // altura sea igual a la altura de las tarjetas laterales.
  const planAspect = planCapture.width / planCapture.height;
  const planAreaH = sideTotalH;
  const planW = planAspect * planAreaH;
  const planH = planAreaH;
  const centerGap = 30;
  const centerW = planW + centerGap;
  const TOTAL_W = sideAreaW * 2 + centerW;

  const TOTAL_H =
    TITLE_H +
    Math.max(planAreaH, bottomTotalH) +
    PADDING * 2 +
    (bottomTables.length > 0 ? bottomTotalH + 80 : 0);

  // Crear canvas a ALTA RESOLUCIÓN (mundo * RENDER_SCALE)
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(TOTAL_W * RENDER_SCALE);
  canvas.height = Math.round(TOTAL_H * RENDER_SCALE);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el contexto de canvas 2D.");

  // Aplicar escala: el resto del código sigue usando coords del mundo
  ctx.scale(RENDER_SCALE, RENDER_SCALE);

  // Fondo blanco
  ctx.fillStyle = PAGE_BG;
  ctx.fillRect(0, 0, TOTAL_W, TOTAL_H);

  // Título
  drawTitle(ctx, TOTAL_W, TITLE_H, invitationName);

  // Dibujar la imagen del plano capturado
  const planImg = await loadImage(planCapture.dataUrl);
  const planX = sideAreaW + centerGap / 2;
  const planY = TITLE_H + PADDING;
  ctx.drawImage(planImg, planX, planY, planW, planH);

  // Tarjetas laterales
  drawCardGrid(
    ctx,
    leftTables,
    PADDING,
    TITLE_H + PADDING,
    leftRowHeights,
    guestIndex,
    false,
  );
  // Right: alineado al borde derecho con PADDING de margen
  // (antes: TOTAL_W - PADDING - sideAreaW + PADDING, que daba 50px de offset)
  drawCardGrid(
    ctx,
    rightTables,
    TOTAL_W - PADDING - sideCardW,
    TITLE_H + PADDING,
    rightRowHeights,
    guestIndex,
    false,
  );

  // Tarjetas inferiores (centradas)
  if (bottomTables.length > 0) {
    const fullRowW = COLS_PER_SIDE * CARD_W + (COLS_PER_SIDE - 1) * CARD_GAP_X;
    const bottomStartX = (TOTAL_W - fullRowW) / 2;
    const bottomStartY = TITLE_H + PADDING + sideTotalH + 80;

    drawCardGrid(
      ctx,
      bottomTables,
      bottomStartX,
      bottomStartY,
      bottomRowHeights,
      guestIndex,
      true,
    );
  }

  // Convertir a PNG
  const dataUrl = canvas.toDataURL("image/png");
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function drawTitle(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  titleH: number,
  invitationName: string,
) {
  ctx.fillStyle = TEXT_DARK;
  ctx.font = "bold 90px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(invitationName.toUpperCase(), canvasW / 2, titleH * 0.42);

  ctx.fillStyle = ACCENT_DARK;
  ctx.font = "500 28px sans-serif";
  ctx.fillText("DISTRIBUCIÓN DE MESAS", canvasW / 2, titleH * 0.78);
}

function drawCardGrid(
  ctx: CanvasRenderingContext2D,
  tables: SeatingElement[],
  startX: number,
  startY: number,
  rowHeights: number[],
  guestIndex: Map<string, { family: FamilyElement; guest: FamilyElement["guests"][number] }>,
  centerIncompleteRows: boolean,
) {
  if (tables.length === 0) return;

  const perRow = COLS_PER_SIDE;
  const fullRowW = perRow * CARD_W + (perRow - 1) * CARD_GAP_X;
  let curY = startY;

  for (let r = 0; r < rowHeights.length; r++) {
    const rowH = rowHeights[r];
    const startIdx = r * perRow;
    const endIdx = Math.min(startIdx + perRow, tables.length);
    const cardsInRow = endIdx - startIdx;

    let rowStartX = startX;
    if (centerIncompleteRows && cardsInRow < perRow) {
      const totalW = cardsInRow * CARD_W + (cardsInRow - 1) * CARD_GAP_X;
      rowStartX = startX + (fullRowW - totalW) / 2;
    }

    for (let c = 0; c < cardsInRow; c++) {
      const idx = startIdx + c;
      const table = tables[idx];
      const x = rowStartX + c * (CARD_W + CARD_GAP_X);
      const y = curY;
      const tableH = cardHeightForTable(table);
      drawTableCard(ctx, table, x, y, CARD_W, rowH, guestIndex, tableH);
    }

    curY += rowH + CARD_GAP_Y;
  }
}

function cardHeightForTable(table: SeatingElement): number {
  const rowsInCard = Math.ceil(table.seats / 2);
  return 30 + 38 + 16 + rowsInCard * SEAT_ROW_H + 22;
}

function drawTableCard(
  ctx: CanvasRenderingContext2D,
  table: SeatingElement,
  x: number,
  y: number,
  w: number,
  h: number,
  guestIndex: Map<string, { family: FamilyElement; guest: FamilyElement["guests"][number] }>,
  contentH: number,
) {
  ctx.fillStyle = CARD_BG;
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();

  ctx.strokeStyle = CARD_BORDER;
  ctx.lineWidth = 2.5;
  roundRect(ctx, x, y, w, h, 14);
  ctx.stroke();

  ctx.fillStyle = TEXT_DARK;
  ctx.font = "bold 26px Georgia, serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(table.alias, x + CARD_PAD, y + 42);

  const seatsStartY = y + 30 + 38 + 6;
  const innerW = w - CARD_PAD * 2;
  const colGap = 24;
  const colW = (innerW - colGap) / 2;
  const half = Math.ceil(table.seats / 2);

  for (let i = 0; i < table.seats; i++) {
    const isLeft = i < half;
    const rowIdx = isLeft ? i : i - half;
    const colIdx = isLeft ? 0 : 1;

    const rowY = seatsStartY + rowIdx * SEAT_ROW_H;
    if (rowY + SEAT_ROW_H > y + contentH - 8) break;

    const colX = x + CARD_PAD + colIdx * (colW + colGap);
    const circleX = colX + SEAT_CIRCLE_D / 2;
    const textX = colX + SEAT_CIRCLE_D + 10;
    const circleY = rowY + SEAT_ROW_H / 2;

    const guestId = table.assignedSeats[i];
    const info = guestId ? guestIndex.get(guestId) : undefined;

    const bg = info ? info.family.colorBg : EMPTY_SEAT;
    const border = info ? info.family.colorBorder : EMPTY_BORDER;
    ctx.beginPath();
    ctx.arc(circleX, circleY, SEAT_CIRCLE_D / 2, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = info ? TEXT_DARK : TEXT_FAINT;
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(i + 1), circleX, circleY);

    ctx.fillStyle = info ? TEXT_DARK : TEXT_FAINT;
    ctx.font = info ? "14px sans-serif" : "italic 13px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const label = info ? info.family.name : "Disponible";
    const maxTextW = colW - SEAT_CIRCLE_D - 10;
    const truncated = truncateText(ctx, label, maxTextW);
    ctx.fillText(truncated, textX, circleY);
  }
}

function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(truncated + "…").width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + "…";
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || "invitacion";
}
