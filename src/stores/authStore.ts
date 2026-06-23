import { create } from "zustand";
import { User as FirebaseUser } from "firebase/auth";

export interface UserProfile extends FirebaseUser {
  roles?: Record<string, "admin" | "host" | "guardia">;
  isRootAdmin?: boolean;
}

type AuthState = {
  user: UserProfile | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (value: boolean) => void;
  getUserRole: (
    invitationId: string | string[] | undefined,
  ) => "admin" | "host" | "guardia" | null;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  getUserRole: (invitationId) => {
    const { user } = get();
    if (!user) return null;
    if (user.isRootAdmin) return "admin";
    if (!invitationId || typeof invitationId !== "string") return null;
    return user.roles?.[invitationId] || null;
  },
}));
