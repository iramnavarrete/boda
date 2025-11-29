import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { AuthService } from "@/services/authService";
import { GuestService } from "@/services/guestService";
import { Guest } from "../../../../types/types";

export function useGuestsData() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState<Guest[]>([]);

  useEffect(() => {
    AuthService.initAuth();
    return AuthService.onUserChange((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = GuestService.subscribeToGuests((data) =>
      setGuests(data)
    );
    return () => unsubscribe();
  }, [user]);

  return { user, loading, guests };
}
