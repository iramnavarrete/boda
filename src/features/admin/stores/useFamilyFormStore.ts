import { create } from "zustand";
import { Family, FamilyFormData } from "@/types";

const DEFAULT_FAMILY: FamilyFormData = {
  nombre: "",
  asistencia: null,
  invitados: 1,
  telefono: null,
  confirmados: null,
  notaInvitado: null,
  cambiosPermitidos: true,
  notaAnfitrion: null,
};

interface FamilyFormState {
  isOpen: boolean;
  currentFamilyId: string | null;
  formData: FamilyFormData;

  openForNew: () => void;
  openForEdit: (family: Family, formData: FamilyFormData) => void;
  close: () => void;
  setFormData: (data: FamilyFormData) => void;
}

export const useFamilyFormStore = create<FamilyFormState>((set) => ({
  isOpen: false,
  currentFamilyId: null,
  formData: { ...DEFAULT_FAMILY },

  openForNew: () =>
    set({
      isOpen: true,
      currentFamilyId: null,
      formData: { ...DEFAULT_FAMILY },
    }),

  openForEdit: (family, formData) =>
    set({
      isOpen: true,
      currentFamilyId: family.id,
      formData,
    }),

  close: () => set({ isOpen: false }),

  setFormData: (data) => set({ formData: data }),
}));
