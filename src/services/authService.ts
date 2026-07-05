import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { UserProfile } from "@/stores/authStore";

export const AuthService = {
  getCurrentUser: () => auth.currentUser,

  logout: () => signOut(auth),

  onUserChange: (callback: (user: UserProfile | null) => void) =>
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Extraemos el token donde viajan los Custom Claims
          const tokenResult = await firebaseUser.getIdTokenResult(true);

          // Combinamos el usuario normal con los roles del token
          const fullProfile: UserProfile = {
            ...firebaseUser,
            roles: tokenResult.claims.roles as Record<
              string,
              "admin" | "host" | "guardia"
            >,
            isRootAdmin: !!tokenResult.claims.isRootAdmin,
          };

          // Enviamos el usuario completo
          callback(fullProfile);
        } catch (error) {
          console.error("Error al obtener los claims", error);
          // Fallback: Si algo falla, pasamos el usuario sin roles para no romper la app
          callback(firebaseUser as UserProfile);
        }
      } else {
        callback(null);
      }
    }),
};
