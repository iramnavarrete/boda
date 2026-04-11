import { useCallback } from "react";
import { Guest } from "@/types";
import { GuestService } from "@/services/guestService";

interface UsGuestDeletionOptions {
  invitationId: string | undefined;
  selectedGuests: Set<string>;
  clearSelection: () => void;
  removeFromSelection: (id: string) => void;
  openConfirmModal: (config: {
    isOpen: boolean;
    title: string;
    message: string;
    isDanger: boolean;
    action: () => Promise<void>;
  }) => void;
}

export function useGuestDeletion({
  invitationId,
  selectedGuests,
  clearSelection,
  removeFromSelection,
  openConfirmModal,
}: UsGuestDeletionOptions) {
  const handleDeleteGuest = useCallback(
    (guest: Guest) => {
      openConfirmModal({
        isOpen: true,
        title: `Eliminar "${guest.nombre}"`,
        message:
          "Esta acción es permanente y no se puede deshacer. ¿Estás seguro de que quieres eliminar este registro?",
        isDanger: true,
        action: async () => {
          if (invitationId) {
            await GuestService.deleteGuest(invitationId, guest.id);
          }
          if (selectedGuests.has(guest.id)) removeFromSelection(guest.id);
        },
      });
    },
    [invitationId, openConfirmModal, selectedGuests, removeFromSelection]
  );

  const handleBulkDelete = useCallback(() => {
    if (selectedGuests.size === 0) return;
    openConfirmModal({
      isOpen: true,
      title: "Eliminar Múltiples Invitados",
      message: `¿Estás seguro de que deseas eliminar permanentemente a los ${selectedGuests.size} invitados seleccionados? Esta acción no se puede deshacer.`,
      isDanger: true,
      action: async () => {
        if (invitationId) {
          await GuestService.batchDeleteGuests(invitationId, Array.from(selectedGuests));
        }
        clearSelection();
      },
    });
  }, [invitationId, selectedGuests, openConfirmModal, clearSelection]);

  return { handleDeleteGuest, handleBulkDelete };
}
