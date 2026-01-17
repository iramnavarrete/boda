"use client";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { GuestService } from "@/services/guestService";
import { Guest } from "@/types";

export function useGuestsData(invitationId: string, user: User) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoadingGuests, setIsLoadingGuests] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = GuestService.subscribeToGuests(
      invitationId,
      (data) => {
        setGuests(data);
        setIsLoadingGuests(false);
      },
      (error) => {
        setGuests([]);
        setIsLoadingGuests(false);
        setError(error.code);
      }
    );
    return unsubscribe;
  }, [user]);

  return { guests, isLoadingGuests, error };
}
