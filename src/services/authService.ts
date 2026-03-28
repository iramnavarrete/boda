import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
export const AuthService = {
  getCurrentUser: () => auth.currentUser,
  logout: () => signOut(auth),
  onUserChange: (callback: (user: User | null) => void) =>
    onAuthStateChanged(auth, callback),
};
