import { useCallback } from "react";
import { Family, FamilyFormData } from "@/types";

interface UseEditActionsProps {
  invitationId?: string;
  currentFamily: Family | null;
  handleOpenModal: (invitationId: string, family?: Family) => Promise<void>;
  handleCloseModal: () => void;
  handleSaveFamily: (
    currentFamily: Family | null,
    formData: FamilyFormData,
    onSuccess: () => void,
  ) => Promise<void>;
}

export function useEditActions({
  invitationId,
  currentFamily,
  handleOpenModal,
  handleCloseModal,
  handleSaveFamily,
}: UseEditActionsProps) {
  const handleEdit = useCallback(
    (family: Family) => {
      if (invitationId) handleOpenModal(invitationId, family);
    },
    [invitationId, handleOpenModal],
  );

  const handleNewFamily = useCallback(() => {
    if (invitationId) handleOpenModal(invitationId);
  }, [invitationId, handleOpenModal]);

  const onSaveFamily = useCallback(
    (finalData: FamilyFormData) => {
      handleSaveFamily(currentFamily, finalData, handleCloseModal);
    },
    [handleSaveFamily, currentFamily, handleCloseModal],
  );

  return {
    handleEdit,
    handleNewFamily,
    onSaveFamily,
  };
}
