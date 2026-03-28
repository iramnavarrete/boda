import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Guest } from "../../types/types";

export const exportGuestsToExcel = async (guests: Guest[]) => {
  // 1. Crear el libro de trabajo y la hoja
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Invitados");

  // 2. Definir las columnas (Encabezados y anchos)
  worksheet.columns = [
    { header: "ID", key: "id", width: 10 },
    { header: "Nombre Completo", key: "nombre", width: 30 },
    { header: "WhatsApp", key: "telefono", width: 15 },
    { header: "Estado Asistencia", key: "estado", width: 18 },
    { header: "Cupos Totales", key: "invitados", width: 12 },
    { header: "Confirmados", key: "confirmados", width: 12 },
    { header: "Mensaje", key: "mensaje", width: 35 },
    { header: "Comentarios", key: "comentarios", width: 35 },
    { header: "Cambios permitidos", key: "cambiosPermitidos", width: 12 },
    { header: "Fecha Registro", key: "fechaCreacion", width: 15 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.commit();

  // 4. Procesar y agregar los datos
  guests.forEach((guest) => {
    // Formatear Fecha
    let fechaCreacionStr = "";
    if (
      guest.fechaCreacion &&
      typeof (guest.fechaCreacion as any).toDate === "function"
    ) {
      fechaCreacionStr = (guest.fechaCreacion as any)
        .toDate()
        .toLocaleDateString();
    }

    let ultimaModificacionStr = "";
    if (
      guest.ultimaModificacion &&
      typeof (guest.ultimaModificacion as any).toDate === "function"
    ) {
      ultimaModificacionStr = (guest.ultimaModificacion as any)
        .toDate()
        .toLocaleDateString();
    }

    // --- DETERMINAR ESTADO Y COLOR ---
    let estadoTexto = "PENDIENTE";
    let fontColor = "FF9C5700"; // Texto oscuro para contraste (Naranja oscuro)

    if (guest.asistencia === true) {
      estadoTexto = "CONFIRMADO";
      fontColor = "FF006100"; // Verde oscuro
    } else if (guest.asistencia === false) {
      estadoTexto = "RECHAZADO";
      fontColor = "FF9C0006"; // Rojo oscuro
    }

    // Agregar la fila usando las 'keys' definidas arriba
    const row = worksheet.addRow({
      id: guest.id,
      nombre: guest.nombre,
      telefono: guest.tieneTelefono || "",
      estado: estadoTexto,
      invitados: guest.invitados,
      confirmados: guest.confirmados || "",
      mensaje: guest.notaAnfitrion || "",
      comentarios: guest.notaInvitado || "",
      cambiosPermitidos: guest.cambiosPermitidos ? "Permitido" : "Bloqueado",
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
