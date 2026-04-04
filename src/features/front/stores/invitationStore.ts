import { create } from "zustand";
import { Invitation } from "@/types";

export type InvitationDataState = Invitation & {
  eventUrl?: string;
  fechaISO?: string;
};

interface InvitationStore {
  invitationData: InvitationDataState | null;
  setInvitationData: (data: InvitationDataState) => void;
}

export const useInvitationStore = create<InvitationStore>((set) => ({
  invitationData: null,
  setInvitationData: (data) => set({ invitationData: data }),
}));
