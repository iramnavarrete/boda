import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
  PageOrientation,
  convertInchesToTwip,
  ShadingType,
} from "docx";
import { saveAs } from "file-saver";
import { SeatingElement, FamilyElement } from "@/types/seating";
import { capturePlanCanvas } from "./planCapture";

export interface DocxExportOptions {
  invitationName: string;
  elements: SeatingElement[];
  families: FamilyElement[];
  /** (Deprecado) Se conserva por compatibilidad con la firma del hook. */
  zoom?: number;
}

const LETTER_W_IN = 8.5;
const LETTER_H_IN = 11;
const MARGIN_IN = 0.5;

const ACCENT = "C5A669";
const TEXT_DARK = "2C2C29";
const TEXT_MUTED = "5A5A5A";
const BORDER = "EBE5DA";

/**
 * Genera el DOCX:
 *   Hoja 1: imagen del plano (capturada con html-to-image)
 *   Hoja 2: listado de invitados por mesa (texto formateado, sin tablas)
 */
export async function exportPlanToDocx(opts: DocxExportOptions) {
  const { invitationName, elements, families } = opts;

  // 1) Renderizar el plano a alta resolución (2.5x)
  const captured = await capturePlanCanvas(elements, families, {
    dpi: 300,
    pixelRatio: 2.5,
  });
  const pngBytes = dataUrlToBytes(captured.dataUrl);

  // 2) Hoja 1: imagen
  const isLandscape = true;
  const pageAvailW = isLandscape
    ? LETTER_H_IN - MARGIN_IN * 2
    : LETTER_W_IN - MARGIN_IN * 2;
  const pageAvailH = isLandscape
    ? LETTER_W_IN - MARGIN_IN * 2
    : LETTER_H_IN - MARGIN_IN * 2;
  const titleBlockH = 0.7;
  const imgAvailH = pageAvailH - titleBlockH;
  const imgAvailW = pageAvailW;
  const pngAspect = captured.width / captured.height;
  const cellAspect = imgAvailW / imgAvailH;
  let renderW: number;
  let renderH: number;
  if (pngAspect > cellAspect) {
    renderW = imgAvailW;
    renderH = imgAvailW / pngAspect;
  } else {
    renderH = imgAvailH;
    renderW = imgAvailH * pngAspect;
  }

  const planSection = {
    properties: {
      page: {
        size: {
          width: isLandscape ? LETTER_H_IN : LETTER_W_IN,
          height: isLandscape ? LETTER_W_IN : LETTER_H_IN,
          orientation: isLandscape
            ? PageOrientation.LANDSCAPE
            : PageOrientation.PORTRAIT,
        },
        margin: {
          top: convertInchesToTwip(MARGIN_IN),
          bottom: convertInchesToTwip(MARGIN_IN),
          left: convertInchesToTwip(MARGIN_IN),
          right: convertInchesToTwip(MARGIN_IN),
        },
      },
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: invitationName.toUpperCase(),
            bold: true,
            size: 28,
            color: TEXT_DARK,
            font: "Georgia",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: "Distribución de mesas",
            italics: true,
            size: 22,
            color: ACCENT,
            font: "Georgia",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: pngBytes,
            transformation: {
              width: Math.round(renderW * 96),
              height: Math.round(renderH * 96),
            },
            type: "png",
          } as any),
        ],
      }),
    ],
  };

  // 3) Hoja 2: listado
  const tableSection = buildTextListingSection(elements, families);

  const doc = new Document({
    creator: "JN Invitaciones",
    title: `Plano de mesas - ${invitationName}`,
    description: "Distribución de mesas e invitados",
    sections: [planSection, tableSection],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `plano-mesas-${slugify(invitationName)}.docx`;
  saveAs(blob, fileName);
}

function buildTextListingSection(
  elements: SeatingElement[],
  families: FamilyElement[],
) {
  const tables = elements.filter((e) => e.seats > 0);
  const sortedTables = [...tables].sort((a, b) => {
    const an = parseInt(a.alias.replace(/\D/g, ""), 10);
    const bn = parseInt(b.alias.replace(/\D/g, ""), 10);
    if (!isNaN(an) && !isNaN(bn) && an !== bn) return an - bn;
    return a.alias.localeCompare(b.alias);
  });

  const guestIndex = new Map<
    string,
    { family: FamilyElement; guest: FamilyElement["guests"][number] }
  >();
  for (const f of families) {
    for (const g of f.guests) {
      if (g.id) guestIndex.set(g.id, { family: f, guest: g });
    }
  }

  const totalSeats = sortedTables.reduce((acc, t) => acc + t.seats, 0);
  const assignedCount = sortedTables.reduce(
    (acc, t) => acc + t.assignedSeats.filter((id) => !!id).length,
    0,
  );

  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: "Listado de invitados por mesa",
          bold: true,
          size: 30,
          color: TEXT_DARK,
          font: "Georgia",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 320 },
      children: [
        new TextRun({
          text: `${sortedTables.length} mesas · ${assignedCount} de ${totalSeats} asientos`,
          italics: true,
          size: 20,
          color: TEXT_MUTED,
        }),
      ],
    }),
  ];

  for (const table of sortedTables) {
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        shading: { type: ShadingType.CLEAR, fill: ACCENT, color: "auto" },
        children: [
          new TextRun({
            text: `  ${table.alias.toUpperCase()}  `,
            bold: true,
            color: "FFFFFF",
            size: 24,
            font: "Georgia",
          }),
        ],
      }),
    );

    for (let i = 0; i < table.seats; i++) {
      const guestId = table.assignedSeats[i];
      const info = guestId ? guestIndex.get(guestId) : undefined;
      const familyName = info?.family.name || "—";
      const guestName = info?.guest.nombre || "—";

      children.push(
        new Paragraph({
          spacing: { after: 40 },
          tabStops: [
            { type: "left" as any, position: convertInchesToTwip(0.5) },
            { type: "left" as any, position: convertInchesToTwip(2.5) },
            { type: "right" as any, position: convertInchesToTwip(7.0) },
          ],
          children: [
            new TextRun({
              text: `Asiento ${i + 1}`,
              bold: true,
              color: TEXT_MUTED,
              size: 18,
            }),
            new TextRun({ text: "\t", size: 18 }),
            new TextRun({
              text: familyName,
              color: TEXT_DARK,
              size: 18,
            }),
            new TextRun({ text: "\t", size: 18 }),
            new TextRun({
              text: guestName,
              color: TEXT_DARK,
              size: 18,
            }),
          ],
        }),
      );
    }

    children.push(
      new Paragraph({
        spacing: { before: 80, after: 80 },
        border: {
          bottom: {
            color: BORDER,
            space: 1,
            style: "single" as any,
            size: 6,
          },
        },
        children: [new TextRun({ text: "" })],
      }),
    );
  }

  return {
    properties: {
      page: {
        size: {
          width: LETTER_W_IN,
          height: LETTER_H_IN,
          orientation: PageOrientation.PORTRAIT,
        },
        margin: {
          top: convertInchesToTwip(MARGIN_IN),
          bottom: convertInchesToTwip(MARGIN_IN),
          left: convertInchesToTwip(MARGIN_IN),
          right: convertInchesToTwip(MARGIN_IN),
        },
      },
    },
    children,
  };
}

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
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || "invitacion";
}
