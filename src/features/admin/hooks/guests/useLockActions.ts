import { useCallback } from "react";
import { Guest } from "@/types";
import { GuestService } from "@/services/guestService";

interface UseLockActionsProps {
  invitationId?: string;
  selectedGuests: Set<string>;
  clearSelection: () => void;
  openConfirmModal: (config: {
    isOpen: boolean;
    title: string;
    message: string;
    isDanger: boolean;
    action: () => Promise<void>;
  }) => void;
  unlockModal: {
    openForGuest: (guest: Guest) => void;
    openForBulk: () => void;
  };
}

export function useLockActions({
  invitationId,
  selectedGuests,
  clearSelection,
  openConfirmModal,
  unlockModal,
}: UseLockActionsProps) {
  const handleLockToggle = useCallback(
    (guest: Guest) => {
      if (guest.cambiosPermitidos) {
        openConfirmModal({
          isOpen: true,
          title: `Bloquear edición a "${guest.nombre}"`,
          message: `Al hacer esto la familia NO podrá modificar su mensaje de felicitación ni confirmar cantidad de invitados.`,
          isDanger: false,
          action: async () => {
            if (invitationId) {
              await GuestService.toggleGuestLock(
                invitationId,
                guest,
                true,
              );
            }
          },
        });
      } else {
        unlockModal.openForGuest(guest);
      }
    },
    [invitationId, openConfirmModal, unlockModal],
  );

  const handleBulkUpdateLock = useCallback(
    (shouldLock: boolean) => {
      if (selectedGuests.size === 0) return;

      if (shouldLock) {
        openConfirmModal({
          isOpen: true,
          title: "Bloquear Edición",
          message: `¿Deseas bloquear la edición para ${selectedGuests.size} familia${selectedGuests.size === 1 ? "" : "s"}? Ya no podrán modificar su mensaje de felicitación ni confirmar cantidad de invitados.`,
          isDanger: false,
          action: async () => {
            if (invitationId) {
              await GuestService.batchUpdateLock(
                invitationId,
                Array.from(selectedGuests),
                true,
              );
            }
            clearSelection();
          },
        });
      } else {
        unlockModal.openForBulk();
      }
    },
    [selectedGuests, invitationId, openConfirmModal, clearSelection, unlockModal],
  );

  return {
    handleLockToggle,
    handleBulkUpdateLock,
  };
}
