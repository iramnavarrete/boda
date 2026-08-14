import { SeatingElement, FamilyElement } from "@/types/seating";

export interface SeatRow {
  tableId: string;
  tableAlias: string;
  seatNumber: number;
  guestId: string | null;
  guestName: string;
  familyName: string;
  status: "confirmed" | "declined" | "pending" | "empty";
}

/**
 * Construye las filas de la tabla exportada, ordenadas por mesa y número
 * de asiento. Incluye también los asientos vacíos para que la tabla
 * refleje 1:1 lo que se ve en el plano.
 */
export function buildSeatRows(
  elements: SeatingElement[],
  families: FamilyElement[],
): SeatRow[] {
  // Index inverso: guestId -> family + guest
  const guestIndex = new Map<string, { family: FamilyElement; guest: FamilyElement["guests"][number] }>();
  for (const f of families) {
    for (const g of f.guests) {
      if (g.id) guestIndex.set(g.id, { family: f, guest: g });
    }
  }

  const rows: SeatRow[] = [];
  // Solo mesas (no áreas)
  const tables = elements
    .filter((e) => e.seats > 0)
    .sort((a, b) => {
      // Orden natural: por alias si es "Mesa N", sino por id.
      const an = parseInt(a.alias.replace(/\D/g, ""), 10);
      const bn = parseInt(b.alias.replace(/\D/g, ""), 10);
      if (!isNaN(an) && !isNaN(bn) && an !== bn) return an - bn;
      return a.alias.localeCompare(b.alias);
    });

  for (const table of tables) {
    for (let i = 0; i < table.seats; i++) {
      const guestId = table.assignedSeats[i] || null;
      if (!guestId) {
        rows.push({
          tableId: table.id,
          tableAlias: table.alias,
          seatNumber: i + 1,
          guestId: null,
          guestName: "",
          familyName: "",
          status: "empty",
        });
        continue;
      }

      const info = guestIndex.get(guestId);
      if (!info) {
        // ID huérfano: se incluye como vacío para mantener la paridad con el plano.
        rows.push({
          tableId: table.id,
          tableAlias: table.alias,
          seatNumber: i + 1,
          guestId: null,
          guestName: "",
          familyName: "",
          status: "empty",
        });
        continue;
      }

      const status = (info.guest.estatus || "pending") as SeatRow["status"];
      rows.push({
        tableId: table.id,
        tableAlias: table.alias,
        seatNumber: i + 1,
        guestId: info.guest.id,
        guestName: info.guest.nombre || "",
        familyName: info.family.name,
        status,
      });
    }
  }

  return rows;
}
