import { getSheetsClient } from "@/utils/google-sheets";
import { NextApiRequest, NextApiResponse } from "next";

const SPREADSHEET_ID = "1ENf4a0DShyG7tPu1NPPwRXGxvCylxIBK5qi-RpO0mwE";
const RANGE = "invitacion!A:F";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<void | { message: string }>
) {
  if (req.method === "PUT") {
    const { id, data } = req.body; // 'data' contendrá la info del formulario

    if (!id || !data) {
      return res.status(400).json({ message: "ID y datos son requeridos." });
    }

    try {
      const sheets = await getSheetsClient();

      // 1. Encontrar la fila del UID
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return res
          .status(404)
          .json({ message: "No se encontraron datos en la hoja." });
      }

      const headers = rows[0] as string[];
      const idColumnIndex = headers.indexOf("id");
      if (idColumnIndex === -1) {
        return res
          .status(500)
          .json({ message: "Columna UID no encontrada en la hoja." });
      }

      let rowIndexToUpdate = -1;
      for (let i = 1; i < rows.length; i++) {
        // Empezar desde 1 para omitir encabezados
        if (rows[i][idColumnIndex] === id) {
          rowIndexToUpdate = i;
          break;
        }
      }

      console.log(rowIndexToUpdate, "INDEX A ACTUALIZAR");

      if (rowIndexToUpdate === -1) {
        return res
          .status(404)
          .json({ message: "Invitado no encontrado para actualizar." });
      }

      // 2. Preparar los datos para la actualización
      const valuesToUpdate = new Array(headers.length).fill(""); // Crear un array vacío del tamaño de los encabezados
      headers.forEach((header, index) => {
        // Mantener los datos existentes que no se van a actualizar
        valuesToUpdate[index] = rows[rowIndexToUpdate][index] || "";
        // Sobreescribir con los nuevos datos si existen en 'data'
        if (data[header] !== undefined) {
          valuesToUpdate[index] = data[header];
        }
      });

      const updateRange = `${RANGE.split("!")[0]}!A${rowIndexToUpdate + 1}`; // +1 porque los índices de Sheets son base 1

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: updateRange,
        valueInputOption: "USER_ENTERED", // Permite que Google Sheets interprete los valores
        requestBody: { values: [valuesToUpdate] },
      });

      return res.status(200).json({
        message: "Información del invitado actualizada exitosamente.",
      });
    } catch (error) {
      console.error("Error al actualizar la hoja de cálculo:", error);
      return res.status(500).json({ message: "Error interno del servidor." });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
