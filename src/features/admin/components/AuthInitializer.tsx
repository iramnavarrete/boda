"use client";

import { useEffect } from "react";
import { AuthService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";

export function AuthInitializer() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const unsubscribe = AuthService.onUserChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [setUser, setLoading]);

  return null;
}
