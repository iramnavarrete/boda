import { User } from "firebase/auth";
import { GuestService } from "@/services/guestService";
import { useToast } from "@/components/Toast";
import { exportGuestsToExcel } from "@/services/excelService";
import { Guest, GuestFormData } from "../../../../types/types";

export function useGuestActions(user: User | null) {
  const { toast } = useToast();

  const handleSaveGuest = async (
    e: React.FormEvent,
    currentGuestId: string | null,
    formData: GuestFormData,
    onSuccess: () => void
  ) => {
    e.preventDefault();
    try {
      if (!user) return;
      const guestId = currentGuestId || (await GuestService.getUniqueGuestId());
      await GuestService.saveGuest(guestId, formData, !currentGuestId);
      toast(
        currentGuestId
          ? "Invitado actualizado correctamente"
          : "Invitado creado con éxito",
        "success"
      );
      onSuccess();
    } catch (error) {
      console.error(error);
      toast("Hubo un error al guardar los datos. Intenta de nuevo.", "error");
    }
  };

  const sendWhatsApp = (guest: Guest) => {
    if (!guest.telefono) return;
    const link = `https://bodajy.info/invitacion/${guest.id}`;
    const msg = `¡Hola ${guest.nombre.split(" ")[0]}! ${
      guest.mensaje || ""
    } Confirma aquí: ${link}`;
    window.open(
      `https://wa.me/${guest.telefono
        .replace(/\+/g, "")
        .replace(/\s/g, "")}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );

    toast("Abriendo WhatsApp...", "info");
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
