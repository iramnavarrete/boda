import { GuestService } from "@/services/guestService";
import { useToast } from "@/features/shared/components/Toast";
import { exportGuestsToExcel } from "@/services/excelService";
import { Guest, GuestFormData } from "@/types";

export function useGuestActions(invitationId?: string) {
  const { toast } = useToast();
  if (!invitationId) {
    return {
      handleSaveGuest: async () => {},
      handleExportExcel: async () => {},
    };
  }

  const handleSaveGuest = async (
    currentGuestId: string | null,
    formData: GuestFormData,
    onSuccess: () => void,
  ) => {
    try {
      const guestId =
        currentGuestId || (await GuestService.getUniqueGuestId(invitationId));
      await GuestService.saveGuest(
        invitationId,
        guestId,
        formData,
        !currentGuestId,
      );
      toast(
        currentGuestId
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

  const handleExportExcel = async (guests: Guest[]) => {
    try {
      await exportGuestsToExcel(guests);
      toast("Descarga iniciada", "success");
    } catch (e) {
      toast("Error", "error");
    }
  };

  return {
    handleSaveGuest,
    handleExportExcel,
  };
}
