import { SeatingElement, FamilyElement } from "@/types/seating";
import { buildGuestIndex } from "./planDrawing";

// Constantes de layout (mismas que exportToImage.ts)
export const CARD_W = 460;
export const CARD_GAP_X = 24;
export const CARD_GAP_Y = 24;
export const CARD_PAD = 22;
export const SEAT_CIRCLE_D = 26;
export const SEAT_ROW_H = 40;
export const COLS_PER_SIDE = 4;

const CARD_BG = "#FFFFFF";
const CARD_BORDER = "#C5A669";
const TEXT_DARK = "#2C2C29";
const TEXT_MUTED = "#5A5A5A";
const TEXT_FAINT = "#A8A29E";
const EMPTY_SEAT = "#EBECEF";
const EMPTY_BORDER = "#A8AEBA";

/**
 * Calcula la altura de una tarjeta en función del número de asientos.
 * Distribución: 2 columnas (asiento 1-5 izq, 6-10 der).
 */
export function cardHeightForTable(table: SeatingElement): number {
  const rowsInCard = Math.ceil(table.seats / 2);
  return 30 + 38 + 16 + rowsInCard * SEAT_ROW_H + 22;
}

/**
 * Dibuja una cuadrícula de tarjetas en el canvas.
 * Las tarjetas se organizan en filas de `colsPerRow` columnas.
 */
export function drawCardGrid(
  ctx: CanvasRenderingContext2D,
  tables: SeatingElement[],
  startX: number,
  startY: number,
  rowHeights: number[],
  colsPerRow: number,
  guestIndex: Map<
    string,
    { family: FamilyElement; guest: FamilyElement["guests"][number] }
  >,
  centerIncompleteRows: boolean,
) {
  if (tables.length === 0) return;

  const fullRowW = colsPerRow * CARD_W + (colsPerRow - 1) * CARD_GAP_X;
  let curY = startY;

  for (let r = 0; r < rowHeights.length; r++) {
    const rowH = rowHeights[r];
    const startIdx = r * colsPerRow;
    const endIdx = Math.min(startIdx + colsPerRow, tables.length);
    const cardsInRow = endIdx - startIdx;

    let rowStartX = startX;
    if (centerIncompleteRows && cardsInRow < colsPerRow) {
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

/**
 * Calcula la altura de cada fila en una lista de tarjetas.
 * Cada fila tiene la altura de la tarjeta más alta.
 */
export function computeRowHeights(
  tablesList: SeatingElement[],
  colsPerRow: number,
): number[] {
  if (tablesList.length === 0) return [];
  const perCol = Math.ceil(tablesList.length / colsPerRow);
  const rowHeights: number[] = [];
  for (let r = 0; r < perCol; r++) {
    let maxH = 0;
    for (let c = 0; c < colsPerRow; c++) {
      const idx = r * colsPerRow + c;
      if (idx < tablesList.length) {
        const h = cardHeightForTable(tablesList[idx]);
        if (h > maxH) maxH = h;
      }
    }
    rowHeights.push(maxH);
  }
  return rowHeights;
}

function drawTableCard(
  ctx: CanvasRenderingContext2D,
  table: SeatingElement,
  x: number,
  y: number,
  w: number,
  h: number,
  guestIndex: Map<
    string,
    { family: FamilyElement; guest: FamilyElement["guests"][number] }
  >,
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
  while (
    truncated.length > 0 &&
    ctx.measureText(truncated + "…").width > maxWidth
  ) {
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

// Re-export buildGuestIndex para que sea accesible desde aquí
export { buildGuestIndex };
