import { useState } from "react";
import { Guest, GuestFormData } from "../../../../types/types";

const DEFAULT_GUEST = {
  nombre: "",
  asistencia: null,
  invitados: 1,
  telefono: null,
  confirmados: null,
  mensaje: null,
  cambiosPermitidos: true,
  comentarios: null,
};

export function useGuestForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGuestId, setCurrentGuestId] = useState<string | null>(null);
  const [formData, setFormData] = useState<GuestFormData>({ ...DEFAULT_GUEST });

  const handleOpenModal = (guest: Guest | null = null) => {
    if (guest) {
      setCurrentGuestId(guest.id);
      setFormData({
        ...guest,
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
