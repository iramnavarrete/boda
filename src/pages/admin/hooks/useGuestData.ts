import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { AuthService } from "@/services/authService";
import { GuestService } from "@/services/guestService";
import { Guest } from "../../../../types/types";

export function useGuestsData(user: User | null) {
  const [guests, setGuests] = useState<Guest[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = GuestService.subscribeToGuests((data) =>
      setGuests(data)
    );
    return () => unsubscribe();
  }, [user]);

  return { guests };
}
