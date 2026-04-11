import { useCallback, useState } from "react";
import { ImportedGuest } from "@/types";
import { GuestService } from "@/services/guestService";
import { useToast } from "@/features/shared/components/Toast";

export function useGuestImport(invitationId: string | undefined) {
  const { toast } = useToast();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = useCallback(
    async (parsedGuests: ImportedGuest[]) => {
      if (!invitationId) return;
      setIsImporting(true);
      try {
        await GuestService.batchImportGuests(invitationId, parsedGuests);
        toast(`${parsedGuests.length} invitados importados exitosamente.`, "success");
        setIsImportModalOpen(false);
      } catch {
        toast("Ocurrió un error al importar los invitados.", "error");
      } finally {
        setIsImporting(false);
      }
    },
    [invitationId, toast]
  );

  return {
    isImportModalOpen,
    isImporting,
    openImportModal: () => setIsImportModalOpen(true),
    closeImportModal: () => setIsImportModalOpen(false),
    handleImport,
  };
}
