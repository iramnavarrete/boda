import {
  PDFDocument,
  StandardFonts,
  rgb,
  PDFPage,
  PDFFont,
  PDFImage,
} from "pdf-lib";
import { saveAs } from "file-saver";
import { SeatingElement, FamilyElement } from "@/types/seating";
import { buildGuestIndex } from "./planDrawing";
import { capturePlanCanvas } from "./planCapture";
import {
  CARD_W,
  CARD_GAP_X,
  CARD_GAP_Y,
  cardHeightForTable,
  computeRowHeights,
  drawCardGrid,
} from "./planCards";
import {
  BRAND_NAME,
  BRAND_TAG,
  BRAND_URL,
  getBrandIconPngBytes,
} from "./planBrand";

export type PaperSize = "A4" | "Letter" | "Legal";
export type PdfOrientation = "landscape" | "portrait";

export interface PdfExportOptions {
  /** Título formateado del evento (ej: "Boda Josué y Yneth"). */
  invitationTitle: string;
  elements: SeatingElement[];
  families: FamilyElement[];
  paperSize: PaperSize;
  orientation: PdfOrientation;
  includeStats: boolean;
  includeGuestList: boolean;
}

/** Tamaño del papel en puntos (1pt = 1/72 in). */
const PAPER_DIMS_PT: Record<PaperSize, [number, number]> = {
  A4: [595.28, 841.89],
  Letter: [612, 792],
  Legal: [612, 1008],
};

/** Píxeles por punto. 2.78 ≈ 200 DPI para nitidez de impresión. */
const PX_PER_PT = 200 / 72;

const ACCENT = rgb(0.773, 0.651, 0.412); // #C5A669
const ACCENT_DARK = rgb(0.627, 0.502, 0.251); // #A08040
const TEXT_DARK = rgb(0.173, 0.173, 0.161); // #2C2C29
const TEXT_MUTED = rgb(0.353, 0.353, 0.353); // #5A5A5A
const FOOTER_GRAY = rgb(0.5, 0.5, 0.5);
const HEADER_GOLD = rgb(0.773, 0.651, 0.412);

const FOOTER_MARGIN_PT = 30;

/**
 * Genera el PDF del plano:
 *   - Hoja 1: portada con el plano + título + estadísticas (opcional)
 *   - Hojas 2..N: listado de tarjetas por mesa, en cuadrícula que fluye
 *                  a varias hojas si no caben.
 *
 * @see https://github.com/Hopding/pdf-lib  (mantenida activamente, Mozilla)
 */
export async function exportPlanToPdf(opts: PdfExportOptions) {
  const {
    invitationTitle,
    elements,
    families,
    paperSize,
    orientation,
    includeStats,
    includeGuestList,
  } = opts;

  const guestIndex = buildGuestIndex(families);
  const tables = elements.filter((e) => e.seats > 0);
  const sortedTables = [...tables].sort((a, b) => {
    const an = parseInt(a.alias.replace(/\D/g, ""), 10);
    const bn = parseInt(b.alias.replace(/\D/g, ""), 10);
    if (!isNaN(an) && !isNaN(bn) && an !== bn) return an - bn;
    return a.alias.localeCompare(b.alias);
  });

  const totalGuests = families.reduce((acc, f) => acc + f.guests.length, 0);
  const totalSeats = sortedTables.reduce((acc, t) => acc + t.seats, 0);
  const assignedCount = sortedTables.reduce(
    (acc, t) => acc + t.assignedSeats.filter((id) => !!id).length,
    0,
  );

  // Crear documento
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Plano de mesas - ${invitationTitle}`);
  pdfDoc.setCreator(BRAND_NAME);
  pdfDoc.setProducer(`${BRAND_NAME} • ${BRAND_URL}`);
  pdfDoc.setSubject(`Distribución de mesas para ${invitationTitle}`);

  // Fuentes (PDF-lib incluye las 14 fuentes estándar de PDF)
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSerif = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontSerifBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontSerifItalic = await pdfDoc.embedFont(
    StandardFonts.TimesRomanItalic,
  );

  const [baseW, baseH] = PAPER_DIMS_PT[paperSize];
  const isLandscape = orientation === "landscape";
  const pageW = isLandscape ? baseH : baseW;
  const pageH = isLandscape ? baseW : baseH;

  // Calcular layout de tarjetas por hoja
  const colsPerPage = isLandscape ? 4 : 3;
  const pxW = Math.round(pageW * PX_PER_PT);
  const pxH = Math.round(pageH * PX_PER_PT);
  const cardsPerPage = computeCardsPerPage(pxW, pxH, colsPerPage, sortedTables);

  const cardPages = includeGuestList
    ? Math.ceil(sortedTables.length / cardsPerPage)
    : 0;
  const totalPages = 1 + cardPages;

  // Renderizar plano a alta resolución
  const captured = await capturePlanCanvas(elements, families, {
    dpi: 300,
    pixelRatio: 2.5,
  });
  const planBytes = dataUrlToBytes(captured.dataUrl);
  const planImage = await pdfDoc.embedPng(planBytes);

  // ========== HOJA 1: Portada ==========
  const page1 = pdfDoc.addPage([pageW, pageH]);
  drawCoverPage(
    page1,
    pageW,
    pageH,
    planImage,
    {
      title: invitationTitle,
      stats: includeStats
        ? {
            totalGuests,
            totalTables: sortedTables.length,
            assignedCount,
            totalSeats,
          }
        : null,
    },
    { fontSerifBold, fontSerifItalic, fontBold, fontRegular },
  );

  // ========== HOJAS 2..N: Distribución de tarjetas ==========
  for (let p = 0; p < cardPages; p++) {
    const startIdx = p * cardsPerPage;
    const endIdx = Math.min(startIdx + cardsPerPage, sortedTables.length);
    const pageTables = sortedTables.slice(startIdx, endIdx);

    const pageCanvas = await renderCardsPageCanvas(
      pageTables,
      pxW,
      pxH,
      colsPerPage,
      guestIndex,
    );
    const pageBytes = dataUrlToBytes(pageCanvas.dataUrl);
    const pageImage = await pdfDoc.embedPng(pageBytes);
    const page = pdfDoc.addPage([pageW, pageH]);
    page.drawImage(pageImage, { x: 0, y: 0, width: pageW, height: pageH });
  }

  // ========== FOOTER en cada hoja ==========
  // Cargar el logo de la marca para el footer
  const brandIconBytes = await getBrandIconPngBytes();
  const brandIconImage = await pdfDoc.embedPng(brandIconBytes);

  const allPages = pdfDoc.getPages();
  allPages.forEach((p, i) => {
    drawFooter(
      p,
      pageW,
      pageH,
      i + 1,
      totalPages,
      fontRegular,
      fontSerifItalic,
      brandIconImage,
    );
  });

  // Guardar
  const pdfBytes = await pdfDoc.save();
  const fileName = `plano-mesas-${slugify(invitationTitle)}.pdf`;
  saveAs(new Blob([pdfBytes.slice()], { type: "application/pdf" }), fileName);
}

// =====================================================================
// Portada (hoja 1)
// =====================================================================

interface CoverFonts {
  fontSerifBold: PDFFont;
  fontSerifItalic: PDFFont;
  fontBold: PDFFont;
  fontRegular: PDFFont;
}

function drawCoverPage(
  page: PDFPage,
  pageW: number,
  pageH: number,
  planImage: PDFImage,
  opts: {
    title: string;
    stats: {
      totalGuests: number;
      totalTables: number;
      assignedCount: number;
      totalSeats: number;
    } | null;
  },
  fonts: CoverFonts,
) {
  const { fontSerifBold, fontSerifItalic, fontBold, fontRegular } = fonts;

  // ----- Título -----
  const titleSize = 28;
  const titleText = opts.title.toUpperCase();
  const titleW = fontSerifBold.widthOfTextAtSize(titleText, titleSize);
  const titleY = pageH - 50;
  page.drawText(titleText, {
    x: (pageW - titleW) / 2,
    y: titleY,
    size: titleSize,
    font: fontSerifBold,
    color: TEXT_DARK,
  });

  // Subtítulo
  const subtitleSize = 13;
  const subtitleText = "Distribución de mesas";
  const subtitleW = fontSerifItalic.widthOfTextAtSize(
    subtitleText,
    subtitleSize,
  );
  page.drawText(subtitleText, {
    x: (pageW - subtitleW) / 2,
    y: titleY - 22,
    size: subtitleSize,
    font: fontSerifItalic,
    color: ACCENT_DARK,
  });

  // ----- Estadísticas (opcional) -----
  let planTopY = titleY - 50;
  if (opts.stats) {
    const statsY = titleY - 70;
    const stats = [
      { label: "INVITADOS", value: String(opts.stats.totalGuests) },
      { label: "MESAS", value: String(opts.stats.totalTables) },
      {
        label: "ASIGNADOS",
        value: `${opts.stats.assignedCount} / ${opts.stats.totalSeats}`,
      },
    ];
    const colW = (pageW - 60) / stats.length;
    stats.forEach((s, i) => {
      const cx = 30 + colW * i + colW / 2;
      const vW = fontBold.widthOfTextAtSize(s.value, 22);
      page.drawText(s.value, {
        x: cx - vW / 2,
        y: statsY,
        size: 22,
        font: fontBold,
        color: TEXT_DARK,
      });
      const lW = fontRegular.widthOfTextAtSize(s.label, 9);
      page.drawText(s.label, {
        x: cx - lW / 2,
        y: statsY - 16,
        size: 9,
        font: fontRegular,
        color: TEXT_MUTED,
      });
    });
    planTopY = statsY - 30;
  }

  // ----- Plano centrado -----
  const planMargin = 30;
  const planBottomY = FOOTER_MARGIN_PT;
  const planAvailW = pageW - 2 * planMargin;
  const planAvailH = planTopY - planBottomY - 10;
  const planAspect = planImage.width / planImage.height;
  let planDrawW = planAvailW;
  let planDrawH = planAvailW / planAspect;
  if (planDrawH > planAvailH) {
    planDrawH = planAvailH;
    planDrawW = planAvailH * planAspect;
  }
  const planX = (pageW - planDrawW) / 2;
  const planY = planBottomY + (planAvailH - planDrawH) / 2;
  page.drawImage(planImage, {
    x: planX,
    y: planY,
    width: planDrawW,
    height: planDrawH,
  });
}

// =====================================================================
// Hojas de tarjetas (hojas 2..N)
// =====================================================================

/**
 * ¿Cuántas tarjetas caben por hoja? Depende del tamaño del papel, cols
 * por fila, y altura de cada fila. Calculamos con un muestreo de las
 * alturas reales de las tarjetas a renderizar.
 */
function computeCardsPerPage(
  pxW: number,
  pxH: number,
  colsPerPage: number,
  allTables: SeatingElement[],
): number {
  if (allTables.length === 0) return 0;
  const pageTitleH = 100;
  const pageFooterH = 60;
  const availH = pxH - pageTitleH - pageFooterH;

  // Promedio de altura de las primeras N tarjetas
  const sample = allTables.slice(
    0,
    Math.min(colsPerPage * 3, allTables.length),
  );
  const avgH =
    sample.reduce((acc, t) => acc + cardHeightForTable(t), 0) / sample.length;

  // Filas que caben (asumiendo distribución uniforme)
  const rowsThatFit = Math.max(
    1,
    Math.floor((availH + CARD_GAP_Y) / (avgH + CARD_GAP_Y)),
  );
  return colsPerPage * rowsThatFit;
}

async function renderCardsPageCanvas(
  tables: SeatingElement[],
  pxW: number,
  pxH: number,
  colsPerPage: number,
  guestIndex: Map<
    string,
    { family: FamilyElement; guest: FamilyElement["guests"][number] }
  >,
) {
  const canvas = document.createElement("canvas");
  canvas.width = pxW;
  canvas.height = pxH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el contexto 2D");

  // Fondo blanco
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, pxW, pxH);

  // Título de la hoja
  ctx.fillStyle = "#2C2C29";
  ctx.font = "bold 48px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("Distribución de Invitados por Mesa", pxW / 2, 30);

  // Línea dorada bajo el título
  ctx.strokeStyle = "#C5A669";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pxW / 2 - 120, 100);
  ctx.lineTo(pxW / 2 + 120, 100);
  ctx.stroke();

  // Tarjetas
  const titleH = 130;
  const startY = titleH;
  const fullRowW = colsPerPage * CARD_W + (colsPerPage - 1) * CARD_GAP_X;
  const startX = (pxW - fullRowW) / 2;

  const rowHeights = computeRowHeights(tables, colsPerPage);

  drawCardGrid(
    ctx,
    tables,
    startX,
    startY,
    rowHeights,
    colsPerPage,
    guestIndex,
    false,
  );

  return { dataUrl: canvas.toDataURL("image/png") };
}

// =====================================================================
// Footer (todas las hojas)
// =====================================================================

function drawFooter(
  page: PDFPage,
  pageW: number,
  pageH: number,
  pageNum: number,
  totalPages: number,
  fontRegular: PDFFont,
  fontItalic: PDFFont,
  brandIconImage: PDFImage,
) {
  const size = 8;
  const yText = 14;
  const iconH = 12; // pt
  const iconAspect = brandIconImage.width / brandIconImage.height;
  const iconW = iconH * iconAspect;
  const sideMargin = 20;

  // Calcular anchos de texto
  const tagW = fontRegular.widthOfTextAtSize(BRAND_TAG, size);
  const gap = 6;
  const blockCenterY = yText + size / 2;

  // URL alineada a la izquierda
  page.drawText(BRAND_URL, {
    x: sideMargin,
    y: yText,
    size,
    font: fontRegular,
    color: FOOTER_GRAY,
  });

  // "Generado con..." + logo centrado
  const centerBlockW = tagW + gap + iconW;
  let cursorX = (pageW - centerBlockW) / 2;
  page.drawText(BRAND_TAG, {
    x: cursorX,
    y: yText,
    size,
    font: fontRegular,
    color: FOOTER_GRAY,
  });
  cursorX += tagW + gap;
  page.drawImage(brandIconImage, {
    x: cursorX,
    y: blockCenterY - iconH / 2,
    width: iconW,
    height: iconH,
  });

  // Info de página (alineado a la derecha)
  const pageInfo = `Página ${pageNum} de ${totalPages}`;
  const pageInfoW = fontItalic.widthOfTextAtSize(pageInfo, size);
  page.drawText(pageInfo, {
    x: pageW - pageInfoW - sideMargin,
    y: yText,
    size,
    font: fontItalic,
    color: FOOTER_GRAY,
  });
}

// =====================================================================
// Utils
// =====================================================================

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
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
