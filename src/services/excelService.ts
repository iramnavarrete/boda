import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Family, GuestSeat } from "@/types";
import { SeatingElement } from "@/types/seating";

/** Opciones para personalizar la exportación a Excel. */
export interface ExportFamiliesOptions {
  /** Plano de mesas para resolver la distribución por familia. */
  seatingElements?: SeatingElement[];
}

/**
 * Construye un índice `guestId -> alias de mesa` recorriendo el plano.
 * Devuelve un mapa vacío si no hay elementos para evitar lookup en
 * bucles grandes.
 */
function buildGuestToTableIndex(
  elements: SeatingElement[],
): Map<string, string> {
  const index = new Map<string, string>();
  for (const el of elements) {
    if (!el.assignedSeats || el.assignedSeats.length === 0) continue;
    for (const guestId of el.assignedSeats) {
      if (guestId) index.set(guestId, el.alias);
    }
  }
  return index;
}

/**
 * Ordena alias tipo "Mesa 2" / "Mesa 10" de forma natural
 * (1 antes que 10). Si no se puede parsear el número, cae
 * a comparación alfabética con soporte para acentos.
 */
function naturalCompareAlias(a: string, b: string): number {
  const na = parseInt(a.replace(/\D/g, ""), 10);
  const nb = parseInt(b.replace(/\D/g, ""), 10);
  if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb;
  return a.localeCompare(b, "es");
}

/**
 * Devuelve la distribución de los invitados de una familia en sus mesas,
 * una mesa por línea, en un formato claro para imprimir:
 *  - "5 / Mesa 2"               → toda la familia en una mesa
 *  - "2 / Mesa 2\n3 / Mesa 4"   → familia repartida
 *  - "Sin asignar"               → nadie con mesa
 */
function getFamilyDistribution(
  family: Family,
  guestToTable: Map<string, string>,
): string {
  const seats: GuestSeat[] = family.asientos ?? [];
  if (seats.length === 0) return "Sin asignar";

  // Contamos cuántos invitados de esta familia van a cada mesa.
  const counts = new Map<string, number>();
  for (const seat of seats) {
    const alias = guestToTable.get(seat.id);
    if (alias) counts.set(alias, (counts.get(alias) ?? 0) + 1);
  }

  if (counts.size === 0) return "Sin asignar";

  return Array.from(counts.entries())
    .sort(([a], [b]) => naturalCompareAlias(a, b))
    .map(([alias, count]) => `${count} / ${alias}`)
    .join("\n");
}

/** Estilo de borde fino y visible para toda la tabla. */
const CELL_BORDER: ExcelJS.Border = {
  style: "thin",
  color: { argb: "FF8C8C8C" },
};

const ALL_BORDERS: ExcelJS.Borders = {
  top: CELL_BORDER,
  left: CELL_BORDER,
  bottom: CELL_BORDER,
  right: CELL_BORDER,
  // ExcelJS obliga a declarar `diagonal`; sin bordes diagonales
  // simplemente lo dejamos vacío.
  diagonal: {},
};

/**
 * Aplica el estilo base (alineación arriba-izq + bordes) a una fila.
 */
function styleBaseRow(row: ExcelJS.Row): void {
  row.eachCell((cell) => {
    cell.alignment = { horizontal: "left", vertical: "top" };
    cell.border = ALL_BORDERS;
  });
}

export const exportFamiliesToExcel = async (
  families: Family[],
  options: ExportFamiliesOptions = {},
) => {
  const { seatingElements = [] } = options;
  const guestToTable = buildGuestToTableIndex(seatingElements);

  // 1. Crear el libro de trabajo y la hoja
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Invitados");

  // 2. Definir las columnas (Encabezados y anchos)
  type Column = {
    header: string;
    key: string;
    width: number;
  };

  const columns: Column[] = [
    { header: "Nombre Completo", key: "nombre", width: 30 },
    { header: "Estado Asistencia", key: "estado", width: 18 },
    { header: "Cupos Totales", key: "invitados", width: 12 },
    { header: "Confirmados", key: "confirmados", width: 12 },
    { header: "Personas / Mesa asignada", key: "mesa", width: 32 },
  ];

  worksheet.columns = columns;

  // 3. Estilo del header
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  styleBaseRow(headerRow);
  headerRow.commit();

  // 4. Procesar y agregar los datos
  families.forEach((family) => {
    // --- DETERMINAR ESTADO Y COLOR ---
    let estadoTexto = "PENDIENTE";
    let fontColor = "FF9C5700"; // Texto oscuro para contraste (Naranja oscuro)

    if (family.asistencia === true) {
      estadoTexto = "CONFIRMADO";
      fontColor = "FF006100"; // Verde oscuro
    } else if (family.asistencia === false) {
      estadoTexto = "RECHAZADO";
      fontColor = "FF9C0006"; // Rojo oscuro
    }

    const row = worksheet.addRow({
      nombre: family.nombre,
      estado: estadoTexto,
      invitados: family.invitados,
      confirmados: family.confirmados || "",
      mesa: getFamilyDistribution(family, guestToTable),
    });

    // Estilo base: arriba-izq + bordes en todas las celdas de la fila
    styleBaseRow(row);

    // --- ESTADO: color + bold para que destaque ---
    const cellEstado = row.getCell("estado");
    cellEstado.font = {
      color: { argb: fontColor },
      bold: true,
    };

    // --- MESA: wrap para que cada mesa quede en su línea ---
    const cellMesa = row.getCell("mesa");
    cellMesa.alignment = { wrapText: true, vertical: "top" };

    // Dejamos que ExcelJS haga el auto-fit de la altura con
    // `wrapText: true` para que la fila quede pegada al contenido
    // (sin hueco extra debajo). El alto mínimo 18pt cubre filas
    // con una sola línea o vacías.
    //
    // Para evitar que el texto se corte cuando la familia está en
    // muchas mesas, dejamos 18pt por línea, que cubre el alto de
    // la fuente (Calibri 11pt) + el padding interno de la celda.
    const mesaText =
      typeof cellMesa.value === "string" || typeof cellMesa.value === "number"
        ? String(cellMesa.value)
        : "";
    const lineCount = mesaText.length === 0 ? 1 : mesaText.split("\n").length;
    row.height = Math.max(18, lineCount * 18);
  });

  // 5. Zona de impresión: mantenemos la orientación vertical (portrait)
  // y escalamos al ancho de UNA sola hoja para que la columna "Mesa"
  // no se quede en otra página. Si hay muchas familias, la tabla
  // crece hacia abajo y el header se repite en cada hoja.
  const lastColLetter = String.fromCharCode(64 + columns.length); // A=65 -> A,B,C...
  const lastRow = families.length + 1; // +1 por la fila del header
  worksheet.pageSetup = {
    orientation: "portrait",
    // El enum `PaperSize` de ExcelJS omite "Letter", pero su código
    // OOXML estándar es 1, así que lo casteamos al tipo.
    paperSize: 1 as ExcelJS.PaperSize,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0, // 0 = ilimitado en vertical
    margins: {
      top: 0.5,
      bottom: 0.5,
      left: 0.5,
      right: 0.5,
      header: 0.3,
      footer: 0.3,
    },
    // Repetir la fila de encabezados en cada página al imprimir
    printTitlesRow: "1:1",
    // Área de impresión explícita: solo las columnas de la tabla hasta
    // la última familia (evita que Excel incluya columnas vacías a la derecha).
    printArea: `A1:${lastColLetter}${lastRow}`,
  };

  // 6. Generar el buffer y descargar
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const fileName = `Invitados_${new Date().toISOString().split("T")[0]}.xlsx`;
  saveAs(blob, fileName);
};
