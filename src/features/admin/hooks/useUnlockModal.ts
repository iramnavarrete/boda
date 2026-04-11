import { useCallback, useState } from "react";
import { Guest } from "@/types";
import { GuestService } from "@/services/guestService";
import { useToast } from "@/features/shared/components/Toast";

interface UnlockModalState {
  isOpen: boolean;
  guest: Guest | null;
  isBulk: boolean;
}

const CLOSED: UnlockModalState = { isOpen: false, guest: null, isBulk: false };

export function useUnlockModal(
  invitationId: string | undefined,
  selectedGuests: Set<string>,
  clearSelection: () => void
) {
  const { toast } = useToast();
  const [modal, setModal] = useState<UnlockModalState>(CLOSED);

  const openForGuest = useCallback(
    (guest: Guest) => setModal({ isOpen: true, guest, isBulk: false }),
    []
  );

  const openForBulk = useCallback(
    () => setModal({ isOpen: true, guest: null, isBulk: true }),
    []
  );

  const close = useCallback(() => setModal(CLOSED), []);

  const execute = useCallback(
    async (newDate: string | null) => {
      if (!invitationId) return;
      try {
        if (modal.isBulk) {
          await GuestService.batchUpdateLock(
            invitationId,
            Array.from(selectedGuests),
            false,
            newDate ?? undefined
          );
          clearSelection();
          toast(`Edición habilitada para ${selectedGuests.size} invitados.`, "success");
        } else if (modal.guest) {
          await GuestService.toggleGuestLock(
            invitationId,
            modal.guest,
            false,
            newDate ?? undefined
          );
          toast(`Edición habilitada para ${modal.guest.nombre}.`, "success");
        }
      } catch {
        toast("Error al habilitar la edición.", "error");
      } finally {
        setModal(CLOSED);
      }
    },
    [invitationId, modal, selectedGuests, clearSelection, toast]
  );

  return { modal, openForGuest, openForBulk, close, execute };
}
