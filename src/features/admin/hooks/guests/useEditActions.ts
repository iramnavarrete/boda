import { useCallback } from "react";
import { Guest, GuestFormData } from "@/types";

interface UseEditActionsProps {
  invitationId?: string;
  currentGuestId: string | null;
  handleOpenModal: (invitationId: string, guest?: Guest) => Promise<void>;
  handleCloseModal: () => void;
  handleSaveGuest: (
    currentGuestId: string | null,
    formData: GuestFormData,
    onSuccess: () => void,
  ) => Promise<void>;
}

export function useEditActions({
  invitationId,
  currentGuestId,
  handleOpenModal,
  handleCloseModal,
  handleSaveGuest,
}: UseEditActionsProps) {
  const handleEdit = useCallback(
    (guest: Guest) => {
      if (invitationId) handleOpenModal(invitationId, guest);
    },
    [invitationId, handleOpenModal],
  );

  const handleNewGuest = useCallback(() => {
    if (invitationId) handleOpenModal(invitationId);
  }, [invitationId, handleOpenModal]);

  const onSaveGuest = useCallback(
    (finalData: GuestFormData) => {
      handleSaveGuest(currentGuestId, finalData, handleCloseModal);
    },
    [handleSaveGuest, currentGuestId, handleCloseModal],
  );

  return {
    handleEdit,
    handleNewGuest,
    onSaveGuest,
  };
}
