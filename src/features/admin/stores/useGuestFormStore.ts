import { create } from "zustand";
import { Guest, GuestFormData } from "@/types";

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

interface GuestFormState {
  isOpen: boolean;
  currentGuestId: string | null;
  formData: GuestFormData;

  openForNew: () => void;
  openForEdit: (guest: Guest, formData: GuestFormData) => void;
  close: () => void;
  setFormData: (data: GuestFormData) => void;
}

export const useGuestFormStore = create<GuestFormState>((set) => ({
  isOpen: false,
  currentGuestId: null,
  formData: { ...DEFAULT_GUEST },

  openForNew: () =>
    set({
      isOpen: true,
      currentGuestId: null,
      formData: { ...DEFAULT_GUEST },
    }),

  openForEdit: (guest, formData) =>
    set({
      isOpen: true,
      currentGuestId: guest.id,
      formData,
    }),

  close: () => set({ isOpen: false }),

  setFormData: (data) => set({ formData: data }),
}));
