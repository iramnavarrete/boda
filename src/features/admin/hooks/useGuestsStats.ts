import { useMemo } from "react";
import { DashboardStats, Guest } from "@/types";

export function useGuestsStats(guests: Guest[]): DashboardStats {
  return useMemo(
    () =>
      guests.reduce(
        (acc, c) => ({
          total: acc.total + (Number(c.invitados) || 0),
          confirmed: acc.confirmed + (Number(c.confirmados) || 0),
          count: acc.count + 1,
        }),
        { total: 0, confirmed: 0, count: 0 }
      ),
    [guests]
  );
}
