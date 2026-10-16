import { useEffect } from "react";
import { Family } from "@/types";
import { FamiliesService } from "@/services/familiesService";
import { isDateInPast } from "@/features/admin/utils/dateComparison";

export function useExpiredFamiliesWatcher(
  families: Family[] | undefined,
  invitationId: string | undefined,
) {
  useEffect(() => {
    if (!families?.length || !invitationId) return;

    const expiredIds = families
      .filter(
        (g) =>
          g.cambiosPermitidos === true &&
          isDateInPast(g.fechaLimiteConfirmacion),
      )
      .map((g) => g.id);

    if (expiredIds.length > 0) {
      FamiliesService.batchUpdateLock(invitationId, expiredIds, true);
    }
  }, [families, invitationId]);
}
