import { saveAs } from "file-saver";
import { SeatingElement, FamilyElement } from "@/types/seating";
import { buildGuestIndex } from "./planDrawing";
import { capturePlanCanvas, CapturedPlan } from "./planCapture";
import {
  CARD_W,
  CARD_GAP_X,
  CARD_GAP_Y,
  COLS_PER_SIDE,
  computeRowHeights,
  drawCardGrid,
} from "./planCards";
import { BRAND_MUTED, BRAND_TAG, BRAND_URL, loadBrandIcon } from "./planBrand";

export interface ImageExportOptions {
  /** Título formateado del evento (ej: "Boda Josué y Yneth"). */
  invitationTitle: string;
  elements: SeatingElement[];
  families: FamilyElement[];
  /**
   * Si es true, incluye la cuadrícula de tarjetas a los lados del plano.
   * Si es false, exporta únicamente el plano (centrado, ajustado al
   * contenido) con la marca de agua al pie.
   */
  includeDistribution?: boolean;
  /**
   * (Deprecado) Se conserva por compatibilidad con la firma del hook.
   * El plano se renderiza a tamaño natural (zoom=1) en el canvas de
   * captura, así que el zoom del editor ya no se usa.
   */
  zoom?: number;
}

const ACCENT_DARK = "#A08040";
const PAGE_BG = "#FFFFFF";
const TEXT_DARK = "#2C2C29";

/** Factor de escala global del canvas final. 2x ≈ 300 DPI. */
const RENDER_SCALE = 2;

const TITLE_H = 200;
const PADDING = 50;
const WATERMARK_H = 80;

/**
 * Render del plano (con o sin tarjetas) a alta resolución.
 *
 * - Modo "con distribución": título + plano + tarjetas laterales (igual
 *   que antes).
 * - Modo "solo plano": título + plano centrado, ajustado al contenido,
 *   con marca de agua al pie.
 *
 * En ambos casos se agrega una marca de agua con el logo de la marca y
 * la URL del sitio.
 */
export async function exportPlanToImage(opts: ImageExportOptions) {
  const { invitationTitle, elements, families } = opts;
  const includeDistribution = opts.includeDistribution ?? true;

  // 1) Renderizar el plano a alta resolución (2.5x por defecto)
  const captured = await capturePlanCanvas(elements, families, {
    dpi: 300,
    pixelRatio: 2.5,
  });

  // 2) Cargar el logo de la marca para la marca de agua
  const brandIcon = await loadBrandIcon();

  // 3) Render del layout final
  const layoutBytes = await renderLayout(
    invitationTitle,
    captured,
    brandIcon,
    elements,
    families,
    includeDistribution,
  );

  const fileName = `plano-mesas-${slugify(invitationTitle)}.png`;
  saveAs(new Blob([layoutBytes.slice()], { type: "image/png" }), fileName);
}

async function renderLayout(
  invitationTitle: string,
  planCapture: CapturedPlan,
  brandIcon: HTMLImageElement,
  elements: SeatingElement[],
  families: FamilyElement[],
  includeDistribution: boolean,
): Promise<Uint8Array> {
  if (!includeDistribution) {
    return renderPlanOnly(invitationTitle, planCapture, brandIcon);
  }
  return renderWithDistribution(
    invitationTitle,
    planCapture,
    brandIcon,
    elements,
    families,
  );
}

// =====================================================================
// MODO: Solo plano (con marca de agua)
// =====================================================================

async function renderPlanOnly(
  invitationTitle: string,
  planCapture: CapturedPlan,
  brandIcon: HTMLImageElement,
): Promise<Uint8Array> {
  // Tamaño objetivo del plano dentro del lienzo
  const TARGET_PLAN_W = 2400;
  const planAspect = planCapture.width / planCapture.height;
  const planW = TARGET_PLAN_W;
  const planH = planW / planAspect;

  // Lienzo total: padding + título + plan + padding + marca de agua
  const TOTAL_W = planW + PADDING * 2;
  const TOTAL_H = TITLE_H + PADDING + planH + PADDING + WATERMARK_H;

  return renderToCanvas(TOTAL_W, TOTAL_H, async (ctx) => {
    // Fondo blanco
    ctx.fillStyle = PAGE_BG;
    ctx.fillRect(0, 0, TOTAL_W, TOTAL_H);

    // Título
    drawTitle(ctx, TOTAL_W, TITLE_H, invitationTitle);

    // Plano centrado
    const planImg = await loadImage(planCapture.dataUrl);
    const planX = PADDING;
    const planY = TITLE_H + PADDING;
    ctx.drawImage(planImg, planX, planY, planW, planH);

    // Marca de agua al pie
    drawWatermark(ctx, TOTAL_W, TOTAL_H, brandIcon);
  });
}

// =====================================================================
// MODO: Con distribución (layout completo)
// =====================================================================

async function renderWithDistribution(
  invitationTitle: string,
  planCapture: CapturedPlan,
  brandIcon: HTMLImageElement,
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

  const leftRowHeights = computeRowHeights(leftTables, COLS_PER_SIDE);
  const rightRowHeights = computeRowHeights(rightTables, COLS_PER_SIDE);
  const bottomRowHeights = computeRowHeights(bottomTables, COLS_PER_SIDE);

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
  const sideCardW = COLS_PER_SIDE * CARD_W + (COLS_PER_SIDE - 1) * CARD_GAP_X;
  const sideAreaW = sideCardW + PADDING * 2;

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
    (bottomTables.length > 0 ? bottomTotalH + 80 : 0) +
    WATERMARK_H;

  return renderToCanvas(TOTAL_W, TOTAL_H, async (ctx) => {
    // Fondo blanco
    ctx.fillStyle = PAGE_BG;
    ctx.fillRect(0, 0, TOTAL_W, TOTAL_H);

    // Título
    drawTitle(ctx, TOTAL_W, TITLE_H, invitationTitle);

    // Plano
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
      COLS_PER_SIDE,
      guestIndex,
      false,
    );
    drawCardGrid(
      ctx,
      rightTables,
      TOTAL_W - PADDING - sideCardW,
      TITLE_H + PADDING,
      rightRowHeights,
      COLS_PER_SIDE,
      guestIndex,
      false,
    );

    // Tarjetas inferiores (centradas)
    if (bottomTables.length > 0) {
      const fullRowW =
        COLS_PER_SIDE * CARD_W + (COLS_PER_SIDE - 1) * CARD_GAP_X;
      const bottomStartX = (TOTAL_W - fullRowW) / 2;
      const bottomStartY = TITLE_H + PADDING + sideTotalH + 80;

      drawCardGrid(
        ctx,
        bottomTables,
        bottomStartX,
        bottomStartY,
        bottomRowHeights,
        COLS_PER_SIDE,
        guestIndex,
        true,
      );
    }

    // Marca de agua al pie
    drawWatermark(ctx, TOTAL_W, TOTAL_H, brandIcon);
  });
}

// =====================================================================
// Helpers comunes
// =====================================================================

/**
 * Crea un canvas a alta resolución (mundo * RENDER_SCALE) y ejecuta
 * la función de dibujo. Devuelve los bytes PNG.
 */
async function renderToCanvas(
  worldW: number,
  worldH: number,
  draw: (ctx: CanvasRenderingContext2D) => void | Promise<void>,
): Promise<Uint8Array> {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(worldW * RENDER_SCALE);
  canvas.height = Math.round(worldH * RENDER_SCALE);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el contexto de canvas 2D.");
  ctx.scale(RENDER_SCALE, RENDER_SCALE);

  await draw(ctx);

  return canvasToBytes(canvas);
}

function canvasToBytes(canvas: HTMLCanvasElement): Uint8Array {
  const dataUrl = canvas.toDataURL("image/png");
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function drawTitle(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  titleH: number,
  invitationTitle: string,
) {
  ctx.fillStyle = TEXT_DARK;
  ctx.font = "bold 90px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(invitationTitle.toUpperCase(), canvasW / 2, titleH * 0.42);

  ctx.fillStyle = ACCENT_DARK;
  ctx.font = "500 28px sans-serif";
  ctx.fillText("DISTRIBUCIÓN DE MESAS", canvasW / 2, titleH * 0.78);
}

/**
 * Marca de agua centrada al pie:
 *   "Generado con" [LOGO] URL
 */
function drawWatermark(
  ctx: CanvasRenderingContext2D,
  totalW: number,
  totalH: number,
  brandIcon: HTMLImageElement,
) {
  // Tamaño del logo en el lienzo (mantener aspecto)
  const logoH = 44;
  const logoAspect = brandIcon.naturalWidth / brandIcon.naturalHeight;
  const logoW = logoH * logoAspect;
  const gap = 14;

  // Tipografía
  ctx.font = "500 20px sans-serif";
  ctx.fillStyle = BRAND_MUTED;
  ctx.textBaseline = "middle";

  // Calcular anchos de texto
  const tagW = ctx.measureText(BRAND_TAG).width;
  const urlW = ctx.measureText(BRAND_URL).width;

  // Bloque total: tag + gap + logo + gap + url
  const blockW = tagW + gap + logoW + gap + urlW;
  let cursorX = (totalW - blockW) / 2;
  const centerY = totalH - WATERMARK_H / 2;

  // Texto "Generado con..."
  ctx.textAlign = "left";
  ctx.fillText(BRAND_TAG, cursorX, centerY);
  cursorX += tagW + gap;

  // Logo
  ctx.drawImage(brandIcon, cursorX, centerY - logoH / 2, logoW, logoH);
  cursorX += logoW + gap;

  // URL
  ctx.fillText(BRAND_URL, cursorX, centerY);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "invitacion"
  );
}

// Re-export COLS_PER_SIDE para que esté accesible desde aquí
// (viene de planCards.ts)
export { COLS_PER_SIDE };
