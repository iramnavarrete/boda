import { useState } from "react";
import { Guest, GuestFormData } from "@/types";
import { useToast } from "@/features/shared/components/Toast";
import { GuestService } from "@/services/guestService";

const DEFAULT_GUEST: GuestFormData = {
  nombre: "",
  asistencia: null,
  invitados: 1,
  telefono: null,
  confirmados: null,
  notaInvitado: null,
  cambiosPermitidos: true,
  notaAnfitrion: null,
};

export function useGuestForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGuestId, setCurrentGuestId] = useState<string | null>(null);
  const [formData, setFormData] = useState<GuestFormData>({ ...DEFAULT_GUEST });

  const handleOpenModal = async (guest: Guest | null = null) => {
    if (guest) {
      setCurrentGuestId(guest.id);
      let contactInfo;
      if (guest.tieneTelefono) {
        contactInfo = await GuestService.getGuestContactInfo(guest.id);
      }
      setFormData({
        ...guest,
        telefono: contactInfo?.telefono || "",
        cambiosPermitidos: !!guest.cambiosPermitidos,
      });
    } else {
      setCurrentGuestId(null);
      setFormData({ ...DEFAULT_GUEST });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return {
    isModalOpen,
    currentGuestId,
    formData,
    setFormData,
    handleOpenModal,
    handleCloseModal,
  };
}
