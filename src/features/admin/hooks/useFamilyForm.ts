import { useFamilyFormStore } from "@/features/admin/stores/useFamilyFormStore";
import { Family, FamilyFormData } from "@/types";
import { FamiliesService } from "@/services/familiesService";
import { useCallback } from "react";

export function useFamilyForm() {
  const isModalOpen = useFamilyFormStore((state) => state.isOpen);
  const currentFamilyId = useFamilyFormStore((state) => state.currentFamilyId);
  const formData = useFamilyFormStore((state) => state.formData);
  const storeOpenForNew = useFamilyFormStore((state) => state.openForNew);
  const storeOpenForEdit = useFamilyFormStore((state) => state.openForEdit);
  const storeClose = useFamilyFormStore((state) => state.close);
  const setFormData = useFamilyFormStore((state) => state.setFormData);

  const handleOpenModal = useCallback(
    async (invitationId: string, family: Family | null = null) => {
      if (family) {
        let contactInfo;
        if (family.tieneTelefono) {
          contactInfo = await FamiliesService.getFamilyContactInfo(
            invitationId,
            family.id,
          );
        }
        const familyFormData: FamilyFormData = {
          ...family,
          telefono: contactInfo?.telefono || "",
          cambiosPermitidos: !!family.cambiosPermitidos,
        };
        storeOpenForEdit(family, familyFormData);
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
    currentFamilyId,
    formData,
    setFormData,
    handleOpenModal,
    handleCloseModal,
  };
}
