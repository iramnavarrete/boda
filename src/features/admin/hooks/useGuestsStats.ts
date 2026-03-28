import { useMemo } from "react";
import { DashboardStats, Guest } from "@/types";

export function useGuestsStats(guests: Guest[]): DashboardStats {
  return useMemo(
    () =>
      guests.reduce(
        (acc, c) => ({
          total: acc.total + (Number(c.invitados) || 0),
          confirmed:
            acc.confirmed + (c.asistencia === true ? Number(c.confirmados) : 0),
          rejected:
            acc.rejected + (c.asistencia === false ? Number(c.invitados) : 0),
          pending:
            acc.pending + (c.asistencia === null ? Number(c.invitados) : 0),
          count: acc.count + 1, // Grupos
        }),
        { total: 0, confirmed: 0, rejected: 0, pending: 0, count: 0 },
      ),
    [guests],
  );
}
