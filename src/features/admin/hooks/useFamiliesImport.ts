import { useCallback, useState } from "react";
import { ImportedFamily } from "@/types";
import { FamiliesService } from "@/services/familiesService";
import { useToast } from "@/features/shared/components/Toast";

export function useFamiliesImport(invitationId: string | undefined) {
  const { toast } = useToast();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = useCallback(
    async (parsedFamilies: ImportedFamily[]) => {
      if (!invitationId) return;
      setIsImporting(true);
      try {
        await FamiliesService.batchImportFamilies(invitationId, parsedFamilies);
        toast(
          `${parsedFamilies.length} familia${parsedFamilies.length === 1 ? "" : "s"} importadas exitosamente.`,
          "success",
        );
        setIsImportModalOpen(false);
      } catch {
        toast("Ocurrió un error al importar las familias.", "error");
      } finally {
        setIsImporting(false);
      }
    },
    [invitationId, toast],
  );

  return {
    isImportModalOpen,
    isImporting,
    openImportModal: () => setIsImportModalOpen(true),
    closeImportModal: () => setIsImportModalOpen(false),
    handleImport,
  };
}
