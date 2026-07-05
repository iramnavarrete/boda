import { useCallback } from "react";
import { Family } from "@/types";
import { FamiliesService } from "@/services/familiesService";

interface UseFamilyDeletionOptions {
  invitationId: string | undefined;
  selectedFamilies: Set<string>;
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

export function useFamilyDeletion({
  invitationId,
  selectedFamilies,
  clearSelection,
  removeFromSelection,
  openConfirmModal,
}: UseFamilyDeletionOptions) {
  const handleDeleteFamily = useCallback(
    (family: Family) => {
      openConfirmModal({
        isOpen: true,
        title: `Eliminar "${family.nombre}"`,
        message:
          "Esta acción es permanente y no se puede deshacer. ¿Estás seguro de que quieres eliminar este registro?",
        isDanger: true,
        action: async () => {
          if (invitationId) {
            await FamiliesService.deleteFamily(invitationId, family.id);
          }
          if (selectedFamilies.has(family.id)) removeFromSelection(family.id);
        },
      });
    },
    [invitationId, openConfirmModal, selectedFamilies, removeFromSelection],
  );

  const handleBulkDelete = useCallback(() => {
    if (selectedFamilies.size === 0) return;
    openConfirmModal({
      isOpen: true,
      title: "Eliminar Múltiples Familias",
      message: `¿Estás seguro de que deseas eliminar permanentemente a las ${selectedFamilies.size} familias seleccionadas? Esta acción no se puede deshacer.`,
      isDanger: true,
      action: async () => {
        if (invitationId) {
          await FamiliesService.batchDeleteFamilies(
            invitationId,
            Array.from(selectedFamilies),
          );
        }
        clearSelection();
      },
    });
  }, [invitationId, selectedFamilies, openConfirmModal, clearSelection]);

  return { handleDeleteFamily, handleBulkDelete };
}
