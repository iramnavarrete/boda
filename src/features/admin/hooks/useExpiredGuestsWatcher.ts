import { useEffect } from "react";
import { Guest } from "@/types";
import { GuestService } from "@/services/guestService";

export function useExpiredGuestsWatcher(
  guests: Guest[] | undefined,
  invitationId: string | undefined,
) {
  useEffect(() => {
    if (!guests?.length || !invitationId) return;

    const today = new Date().toLocaleDateString("en-CA");
    const expiredIds = guests
      .filter(
        (g) =>
          g.cambiosPermitidos === true &&
          g.fechaLimiteConfirmacion &&
          g.fechaLimiteConfirmacion < today,
      )
      .map((g) => g.id);

    if (expiredIds.length > 0) {
      GuestService.batchUpdateLock(invitationId, expiredIds, true);
    }
  }, [guests, invitationId]);
}
