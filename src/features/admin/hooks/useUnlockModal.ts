import { useCallback, useState } from "react";
import { Family } from "@/types";
import { FamiliesService } from "@/services/familiesService";
import { useToast } from "@/features/shared/components/Toast";

interface UnlockModalState {
  isOpen: boolean;
  family: Family | null;
  isBulk: boolean;
}

const CLOSED: UnlockModalState = { isOpen: false, family: null, isBulk: false };

export function useUnlockModal(
  invitationId: string | undefined,
  selectedFamilies: Set<string>,
  clearSelection: () => void,
) {
  const { toast } = useToast();
  const [modal, setModal] = useState<UnlockModalState>(CLOSED);

  const openForFamily = useCallback(
    (family: Family) =>
      setModal({ isOpen: true, family: family, isBulk: false }),
    [],
  );

  const openForBulk = useCallback(
    () => setModal({ isOpen: true, family: null, isBulk: true }),
    [],
  );

  const close = useCallback(() => setModal(CLOSED), []);

  const execute = useCallback(
    async (newDate: string | null) => {
      if (!invitationId) return;
      try {
        if (modal.isBulk) {
          await FamiliesService.batchUpdateLock(
            invitationId,
            Array.from(selectedFamilies),
            false,
            newDate ?? undefined,
          );
          clearSelection();
          toast(
            `Edición habilitada para ${selectedFamilies.size} familias.`,
            "success",
          );
        } else if (modal.family) {
          await FamiliesService.toggleFamilyLock(
            invitationId,
            modal.family,
            false,
            newDate ?? undefined,
          );
          toast(`Edición habilitada para ${modal.family.nombre}.`, "success");
        }
      } catch {
        toast("Error al habilitar la edición.", "error");
      } finally {
        setModal(CLOSED);
      }
    },
    [invitationId, modal, selectedFamilies, clearSelection, toast],
  );

  return { modal, openForFamily, openForBulk, close, execute };
}
