// pages/api/guest/[uid].js
import { NextApiRequest, NextApiResponse } from "next";
import { getSheetsClient } from "../../../utils/google-sheets"; // Asegúrate de la ruta correcta
import { SheetData } from "../../../../types/types";

const SPREADSHEET_ID = "1ENf4a0DShyG7tPu1NPPwRXGxvCylxIBK5qi-RpO0mwE"; // Tu ID de la hoja de cálculo
const RANGE = "invitacion!A:F"; // Rango donde buscar el UID y la información

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SheetData | { message: string }>
) {
  if (req.method === "GET") {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "id es requerido." });
    }

    try {
      const sheets = await getSheetsClient();
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return res.status(404).json({
          message: "No se encontraron datos en la hoja.",
        });
      }

      // Asume que la primera fila son los encabezados y la columna del id es conocida (ej. primera columna)
      const headers = rows[0] as string[];
      const idColumnIndex = headers.indexOf("id");
      if (idColumnIndex === -1) {
        return res.status(500).json({
          message: "Columna id no encontrada en la hoja.",
        });
      }

      const guestRow = rows.find((row) => row[idColumnIndex] === id);

      if (guestRow) {
        const guestData: { [key: string]: string } = {};
        headers.forEach((header: string, index: number) => {
          guestData[header] = guestRow[index] || "";
        });
        return res.status(200).json(guestData as SheetData);
      } else {
        return res.status(404).json({ message: "Invitado no encontrado." });
      }
    } catch (error) {
      console.error("Error al leer la hoja de cálculo:", error);
      return res.status(500).json({ message: "Error interno del servidor." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
