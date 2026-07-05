import { useCallback } from "react";
import { Family } from "@/types";
import { FamiliesService } from "@/services/familiesService";

interface UseLockActionsProps {
  invitationId?: string;
  selectedFamilies: Set<string>;
  clearSelection: () => void;
  openConfirmModal: (config: {
    isOpen: boolean;
    title: string;
    message: string;
    isDanger: boolean;
    action: () => Promise<void>;
  }) => void;
  unlockModal: {
    openForFamily: (family: Family) => void;
    openForBulk: () => void;
  };
}

export function useLockActions({
  invitationId,
  selectedFamilies,
  clearSelection,
  openConfirmModal,
  unlockModal,
}: UseLockActionsProps) {
  const handleLockToggle = useCallback(
    (family: Family) => {
      if (family.cambiosPermitidos) {
        openConfirmModal({
          isOpen: true,
          title: `Bloquear edición a "${family.nombre}"`,
          message: `Al hacer esto la familia NO podrá modificar su mensaje de felicitación ni confirmar cantidad de invitados.`,
          isDanger: false,
          action: async () => {
            if (invitationId) {
              await FamiliesService.toggleFamilyLock(
                invitationId,
                family,
                true,
              );
            }
          },
        });
      } else {
        unlockModal.openForFamily(family);
      }
    },
    [invitationId, openConfirmModal, unlockModal],
  );

  const handleBulkUpdateLock = useCallback(
    (shouldLock: boolean) => {
      if (selectedFamilies.size === 0) return;

      if (shouldLock) {
        openConfirmModal({
          isOpen: true,
          title: "Bloquear Edición",
          message: `¿Deseas bloquear la edición para ${selectedFamilies.size} familia${selectedFamilies.size === 1 ? "" : "s"}? Ya no podrán modificar su mensaje de felicitación ni confirmar cantidad de invitados.`,
          isDanger: false,
          action: async () => {
            if (invitationId) {
              await FamiliesService.batchUpdateLock(
                invitationId,
                Array.from(selectedFamilies),
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
    [
      selectedFamilies,
      invitationId,
      openConfirmModal,
      clearSelection,
      unlockModal,
    ],
  );

  return {
    handleLockToggle,
    handleBulkUpdateLock,
  };
}
