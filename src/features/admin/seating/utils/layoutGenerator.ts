import { SeatingElement } from "../stores/useSeatingStore";

interface LayoutConfig {
  totalTables: number;
  seatsPerTable: number;
  includeDanceFloor: boolean;
  startingIndex: number;
  centerX: number;
  centerY: number;
}

export const generateCustomLayout = ({
  totalTables,
  seatsPerTable,
  includeDanceFloor,
  startingIndex,
  centerX,
  centerY,
}: LayoutConfig): SeatingElement[] => {
  const newElements: SeatingElement[] = [];
  const timestamp = Date.now();

  const tablesPerSide = Math.ceil(totalTables / 2);
  const colsPerSide = 3;
  const rowsPerSide = Math.ceil(tablesPerSide / colsPerSide); // 5 filas para 15 mesas por lado

  const spacingX = 240;
  const spacingY = 220;

  // Calculamos la altura total que ocupará el bloque de mesas
  const totalTablesHeight = (rowsPerSide - 1) * spacingY;

  // 🔥 NUEVO ANCLAJE VERTICAL: Empujamos el centro de las mesas hacia abajo
  // para abrir un espacio seguro en la parte superior para el escenario
  const tablesCenterY = centerY + 80;

  // 1. Si se solicita, agregamos la pista de baile y el escenario
  if (includeDanceFloor) {
    newElements.push({
      id: `dance_floor-${timestamp}-auto`,
      type: "dance_floor",
      alias: "Pista de Baile",
      x: centerX - 100,
      y: tablesCenterY - 100, // Centrada perfectamente con el pasillo de las mesas
      width: 250,
      height: 400,
      seats: 0,
      assignedSeats: [],
    });

    const highestTableY = tablesCenterY - totalTablesHeight / 2 - 45;

    newElements.push({
      id: `stage-${timestamp}-auto`,
      type: "stage",
      alias: "Escenario",
      x: centerX - 300,
      y: highestTableY - 300, // Una fila completa por encima del bloque de mesas
      width: 600,
      height: 200,
      seats: 0,
      assignedSeats: [],
    });
  }

  // 2. Distribución simétrica de mesas en dos bloques laterales
  const centralCorridorWidth = includeDanceFloor ? 520 : 240;
  let tableCount = 0;

  for (const side of ["left", "right"]) {
    let sideTableCount = 0;

    for (let r = 0; r < rowsPerSide; r++) {
      for (let c = 0; c < colsPerSide; c++) {
        if (tableCount >= totalTables || sideTableCount >= tablesPerSide) break;

        let posX = 0;
        if (side === "left") {
          posX = centerX - centralCorridorWidth / 2 - c * spacingX - 45;
        } else {
          posX = centerX + centralCorridorWidth / 2 + c * spacingX - 45;
        }

        // Posicionamos las filas utilizando el nuevo centro desplazado
        const posY = tablesCenterY - totalTablesHeight / 2 + r * spacingY - 45;

        tableCount++;
        sideTableCount++;

        newElements.push({
          id: `round_table-${timestamp}-auto-${tableCount}`,
          type: "round_table",
          alias: `Mesa ${startingIndex + tableCount}`,
          x: posX,
          y: posY,
          width: 140,
          height: 140,
          seats: seatsPerTable,
          assignedSeats: [],
        });
      }
    }
  }

  return newElements;
};
