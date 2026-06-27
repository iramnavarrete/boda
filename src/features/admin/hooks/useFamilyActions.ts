import { FamiliesService } from "@/services/familiesService";
import { useToast } from "@/features/shared/components/Toast";
import { exportFamiliesToExcel } from "@/services/excelService";
import { Family, FamilyFormData } from "@/types";

export function useFamilyActions(invitationId?: string) {
  const { toast } = useToast();
  if (!invitationId) {
    return {
      handleSaveFamily: async () => {},
      handleExportExcel: async () => {},
    };
  }

  const handleSaveFamily = async (
    currentFamilyId: string | null,
    formData: FamilyFormData,
    onSuccess: () => void,
  ) => {
    try {
      const familyId =
        currentFamilyId ||
        (await FamiliesService.getUniqueFamilyId(invitationId));
      await FamiliesService.saveFamily(
        invitationId,
        familyId,
        formData,
        !currentFamilyId,
      );
      toast(
        currentFamilyId
          ? "Familia actualizada correctamente"
          : "Familia creada con éxito",
        "success",
      );
      onSuccess();
    } catch (error) {
      console.error(error);
      toast("Hubo un error al guardar los datos. Intenta de nuevo.", "error");
    }
  };

  const handleExportExcel = async (families: Family[]) => {
    try {
      await exportFamiliesToExcel(families);
      toast("Descarga iniciada", "success");
    } catch (e) {
      toast("Error", "error");
    }
  };

  return {
    handleSaveFamily,
    handleExportExcel,
  };
}
