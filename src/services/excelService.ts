import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Family } from "../../types/types";

export const exportFamiliesToExcel = async (families: Family[]) => {
  // 1. Crear el libro de trabajo y la hoja
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Invitados");

  // 2. Definir las columnas (Encabezados y anchos)
  worksheet.columns = [
    { header: "ID", key: "id", width: 10 },
    { header: "Nombre Completo", key: "nombre", width: 30 },
    { header: "Estado Asistencia", key: "estado", width: 18 },
    { header: "Cupos Totales", key: "invitados", width: 12 },
    { header: "Confirmados", key: "confirmados", width: 12 },
    { header: "Cambios permitidos", key: "cambiosPermitidos", width: 12 },
    { header: "Fecha Registro", key: "fechaCreacion", width: 15 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.commit();

  // 4. Procesar y agregar los datos
  families.forEach((family) => {
    // Formatear Fecha
    let fechaCreacionStr = "";
    if (
      family.fechaCreacion &&
      typeof (family.fechaCreacion as any).toDate === "function"
    ) {
      fechaCreacionStr = (family.fechaCreacion as any)
        .toDate()
        .toLocaleDateString();
    }

    let ultimaModificacionStr = "";
    if (
      family.ultimaModificacion &&
      typeof (family.ultimaModificacion as any).toDate === "function"
    ) {
      ultimaModificacionStr = (family.ultimaModificacion as any)
        .toDate()
        .toLocaleDateString();
    }

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

    // Agregar la fila usando las 'keys' definidas arriba
    const row = worksheet.addRow({
      id: family.id,
      nombre: family.nombre,
      estado: estadoTexto,
      invitados: family.invitados,
      confirmados: family.confirmados || "",
      cambiosPermitidos: family.cambiosPermitidos ? "Permitido" : "Bloqueado",
      fechaCreacion: fechaCreacionStr,
      ultimaModificacion: ultimaModificacionStr,
    });

    // --- APLICAR ESTILO A LA CELDA DE ESTADO ---
    // La columna 'estado' es la 4ta columna
    const cellEstado = row.getCell("estado");

    cellEstado.font = {
      color: { argb: fontColor },
      bold: true,
    };

    // Opcional: Centrar el texto de la celda de estado
    cellEstado.alignment = { horizontal: "center" };
  });

  // 5. Generar el buffer y descargar
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const fileName = `Invitados_${new Date().toISOString().split("T")[0]}.xlsx`;
  saveAs(blob, fileName);
};
