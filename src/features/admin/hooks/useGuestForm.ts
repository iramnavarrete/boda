import { useGuestFormStore } from "@/features/admin/stores/useGuestFormStore";
import { Guest, GuestFormData } from "@/types";
import { GuestService } from "@/services/guestService";
import { useCallback } from "react";

export function useGuestForm() {
  const isModalOpen = useGuestFormStore((state) => state.isOpen);
  const currentGuestId = useGuestFormStore((state) => state.currentGuestId);
  const formData = useGuestFormStore((state) => state.formData);
  const storeOpenForNew = useGuestFormStore((state) => state.openForNew);
  const storeOpenForEdit = useGuestFormStore((state) => state.openForEdit);
  const storeClose = useGuestFormStore((state) => state.close);
  const setFormData = useGuestFormStore((state) => state.setFormData);

  const handleOpenModal = useCallback(
    async (invitationId: string, guest: Guest | null = null) => {
      if (guest) {
        let contactInfo;
        if (guest.tieneTelefono) {
          contactInfo = await GuestService.getGuestContactInfo(
            invitationId,
            guest.id,
          );
        }
        const guestFormData: GuestFormData = {
          ...guest,
          telefono: contactInfo?.telefono || "",
          cambiosPermitidos: !!guest.cambiosPermitidos,
        };
        storeOpenForEdit(guest, guestFormData);
      } else {
        storeOpenForNew();
      }
    },
    [storeOpenForNew, storeOpenForEdit],
  );

  const handleCloseModal = useCallback(() => {
    storeClose();
  }, [storeClose]);

  return {
    isModalOpen,
    currentGuestId,
    formData,
    setFormData,
    handleOpenModal,
    handleCloseModal,
  };
}
