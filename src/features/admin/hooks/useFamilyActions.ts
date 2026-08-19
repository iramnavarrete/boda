import { FamiliesService } from "@/services/familiesService";
import { useToast } from "@/features/shared/components/Toast";
import { exportFamiliesToExcel } from "@/services/excelService";
import { SeatingService } from "@/features/admin/seating/services/seatingService";
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
    currentFamily: Family | null,
    formData: FamilyFormData,
    onSuccess: () => void,
  ) => {
    try {
      // Si la familia es nueva creamos un objeto base con el nuevo ID para pasárselo al servicio
      const familyId =
        currentFamily?.id ||
        (await FamiliesService.getUniqueFamilyId(invitationId));
      const familyToSave = currentFamily || ({ id: familyId } as Family);

      await FamiliesService.saveFamily(
        invitationId,
        familyToSave,
        formData,
        !currentFamily,
      );

      toast(
        currentFamily
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

  /**
   * Exporta la lista de familias a Excel incluyendo la distribución de
   * invitados por mesa. El plano se carga en cada exportación para que
   * la información impresa siempre esté al día.
   */
  const handleExportExcel = async (families: Family[]) => {
    try {
      let seatingElements: Awaited<
        ReturnType<typeof SeatingService.getPlan>
      > = [];
      try {
        seatingElements = await SeatingService.getPlan(invitationId);
      } catch (e) {
        console.error("No se pudo cargar el plano de mesas:", e);
        // Si falla el plano, exportamos igual: la columna Mesa mostrará
        // "Sin asignar" para todas las familias.
      }

      await exportFamiliesToExcel(families, { seatingElements });
      toast("Descarga iniciada", "success");
    } catch (e) {
      console.error(e);
      toast("Error al generar el archivo Excel.", "error");
    }
  };

  return {
    handleSaveFamily,
    handleExportExcel,
  };
}
