import { useCallback } from "react";
import { Family } from "@/types";
import { FamiliesService } from "@/services/familiesService";
import { useToast } from "@/features/shared/components/Toast";

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
  const { toast } = useToast();
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

  // Aplica o quita la fecha límite de confirmación a un lote de
  // familias. En AMBOS casos se setea `cambiosPermitidos = true`
  // (se reactivan los cambios de asistencia). Si `dateStr` es
  // `null`, además se limpia la fecha de cada familia seleccionada.
  //
  // Se llama desde `BulkDeadlineModal`, que gestiona la UI del
  // datepicker + los botones. Esta función SOLO ejecuta el batch
  // update y refresca el state local.
  const handleBulkUpdateDeadline = useCallback(
    async (dateStr: string | null) => {
      if (selectedFamilies.size === 0) return;
      if (!invitationId) return;
      const ids = Array.from(selectedFamilies);
      try {
        // El bloqueo real lo dispara `useExpiredFamiliesWatcher`
        // cuando la fecha pasa — aquí SOLO se persiste
        // `fechaLimiteConfirmacion` (mismo contrato que el envío
        // individual de WhatsApp).
        await FamiliesService.bulkUpdateDeadline(
          invitationId,
          ids,
          dateStr,
        );
        toast(
          dateStr
            ? `Fecha límite aplicada a ${ids.length} ${ids.length === 1 ? "familia" : "familias"}. Cambios habilitados.`
            : `Fecha límite y bloqueo quitados de ${ids.length} ${ids.length === 1 ? "familia" : "familias"}. Cambios habilitados.`,
          "success",
        );
      } catch {
        toast("Error al actualizar la fecha límite.", "error");
      } finally {
        // Refrescar familias desde Firestore para reflejar los cambios.
        clearSelection();
      }
    },
    [invitationId, selectedFamilies, clearSelection, toast],
  );

  return {
    handleLockToggle,
    handleBulkUpdateLock,
    handleBulkUpdateDeadline,
  };
}
