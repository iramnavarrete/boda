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

  const sendWhatsApp = async (guest: Guest) => {
    if (!invitationId) return;

    toast("Abriendo WhatsApp...", "info");

    try {
      const contactInfo = await GuestService.getGuestContactInfo(
        invitationId,
        guest.id,
      );

      const telefono = contactInfo?.telefono;

      if (!telefono) {
        toast("Celular no válido", "error");
        return;
      }

      const link = `https://jninvitaciones.com/i/${invitationId}?guest=${guest.id}s`;

      // Generamos los emojis de forma segura en memoria
      const sparkle = String.fromCodePoint(0x2728);
      const letter = String.fromCodePoint(0x1f48c);

      const msg = `¡Hola ${guest.nombre}!\n${sparkle} Les enviamos el enlace de su invitación digital. ${sparkle}\n\n${letter} La confirmación será únicamente para la recepción, cada invitado cuenta con un lugar asignado. Reservamos ${guest.invitados} lugares en su nombre\n\n${link}`;

      const phoneFormatted = telefono.replace(/\+/g, "").replace(/\s/g, "");

      window.open(
        `https://api.whatsapp.com/send?phone=${phoneFormatted}&text=${encodeURIComponent(msg)}&lang=es`,
        "_blank",
      );
    } catch (error) {
      console.error("Error al obtener información de contacto:", error);
      toast("Error al intentar abrir WhatsApp", "error");
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
    sendWhatsApp,
    handleExportExcel,
  };
}
