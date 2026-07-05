import { useEffect } from "react";
import { Family } from "@/types";
import { FamiliesService } from "@/services/familiesService";

export function useExpiredFamiliesWatcher(
  families: Family[] | undefined,
  invitationId: string | undefined,
) {
  useEffect(() => {
    if (!families?.length || !invitationId) return;

    const today = new Date().toLocaleDateString("en-CA");
    const expiredIds = families
      .filter(
        (g) =>
          g.cambiosPermitidos === true &&
          g.fechaLimiteConfirmacion &&
          g.fechaLimiteConfirmacion < today,
      )
      .map((g) => g.id);

    if (expiredIds.length > 0) {
      FamiliesService.batchUpdateLock(invitationId, expiredIds, true);
    }
  }, [families, invitationId]);
}
