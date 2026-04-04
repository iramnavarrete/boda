import { GuestService } from "@/services/guestService";
import { useToast } from "@/features/shared/components/Toast";
import { exportGuestsToExcel } from "@/services/excelService";
import { Guest, GuestFormData } from "@/types";

export function useGuestActions(invitationId?: string) {
  const { toast } = useToast();
  if (!invitationId) {
    return {
      handleSaveGuest: () => {},
      sendWhatsApp: () => {},
      handleExportExcel: () => {},
    };
  }

  const handleSaveGuest = async (
    e: React.FormEvent,
    currentGuestId: string | null,
    formData: GuestFormData,
    onSuccess: () => void,
  ) => {
    e.preventDefault();
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
          ? "Invitado actualizado correctamente"
          : "Invitado creado con éxito",
        "success",
      );
      onSuccess();
    } catch (error) {
      console.error(error);
      toast("Hubo un error al guardar los datos. Intenta de nuevo.", "error");
    }
  };

  const sendWhatsApp = async (guest: Guest) => {
    toast("Abriendo WhatsApp...", "info");

    const contactInfo = await GuestService.getGuestContactInfo(
      invitationId,
      guest.id,
    );
    const telefono = contactInfo?.telefono;
    if (!telefono) {
      toast("Celular no válido", "error");
      return;
    }
    const link = `https://bodajy.info/invitacion/${guest.id}`;
    const msg = `¡Hola ${guest.nombre.split(" ")[0]}! Confirma aquí: ${link}`;
    window.open(
      `https://wa.me/+${telefono
        .replace(/\+/g, "")
        .replace(/\s/g, "")}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
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
    sendWhatsApp,
    handleExportExcel,
  };
}
