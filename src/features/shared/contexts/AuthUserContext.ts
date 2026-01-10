import { createContext, useContext } from "react";
import type { User } from "firebase/auth";

export const AuthUserContext = createContext<User | null>(null);

export const useAuthUser = (): User => {
  const user = useContext(AuthUserContext);

  if (!user) {
    throw new Error("useAuthUser must be used within a ProtectedPage boundary");
  }

  return user;
};
