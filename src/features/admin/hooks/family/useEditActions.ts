import { useCallback } from "react";
import { Family, FamilyFormData } from "@/types";

interface UseEditActionsProps {
  invitationId?: string;
  currentFamilyId: string | null;
  handleOpenModal: (invitationId: string, family?: Family) => Promise<void>;
  handleCloseModal: () => void;
  handleSaveFamily: (
    currentFamilyId: string | null,
    formData: FamilyFormData,
    onSuccess: () => void,
  ) => Promise<void>;
}

export function useEditActions({
  invitationId,
  currentFamilyId,
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
      handleSaveFamily(currentFamilyId, finalData, handleCloseModal);
    },
    [handleSaveFamily, currentFamilyId, handleCloseModal],
  );

  return {
    handleEdit,
    handleNewFamily,
    onSaveFamily,
  };
}
