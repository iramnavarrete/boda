import { auth } from "@/lib/firebase/config";
import {
  onAuthStateChanged,
  signInWithCustomToken,
  signInAnonymously,
  signOut,
  User,
} from "firebase/auth";
export const AuthService = {
  initAuth: async (token?: string) => {
    if (token) {
      await signInWithCustomToken(auth, token);
    } else {
      await signInAnonymously(auth);
    }
  },
  logout: () => signOut(auth),
  onUserChange: (callback: (user: User | null) => void) =>
    onAuthStateChanged(auth, callback),
};
