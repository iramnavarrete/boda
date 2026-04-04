import { useMemo } from "react";
import { DashboardStats, Guest } from "@/types";

export function useGuestsStats(guests: Guest[]): DashboardStats {
  return useMemo(
    () =>
      guests.reduce(
        (acc, c) => {
          // Extraemos los números de forma segura para que sea más legible
          const invitados = Number(c.invitados) || 0;
          const confirmados = Number(c.confirmados) || 0;

          return {
            total: acc.total + invitados,

            confirmed:
              acc.confirmed + (c.asistencia === true ? confirmados : 0),

            rejected:
              acc.rejected +
              // Si declinaron por completo, sumamos todos los invitados
              (c.asistencia === false ? invitados : 0) +
              // Si confirmaron, sumamos los cupos que "sobraron" o no usaron
              (c.asistencia === true
                ? Math.max(0, invitados - confirmados)
                : 0),

            pending: acc.pending + (c.asistencia === null ? invitados : 0),

            count: acc.count + 1, // Grupos
          };
        },
        { total: 0, confirmed: 0, rejected: 0, pending: 0, count: 0 },
      ),
    [guests],
  );
}
