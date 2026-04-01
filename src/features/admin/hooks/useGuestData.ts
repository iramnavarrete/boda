"use client";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { GuestService } from "@/services/guestService";
import { Guest } from "@/types";
import { FirestoreErrorCode } from "firebase/firestore";

export function useGuestsData(invitationId: string, user: User) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoadingGuests, setIsLoadingGuests] = useState(true);
  const [error, setError] = useState<FirestoreErrorCode | null>(null);

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
      },
    );
    return unsubscribe;
  }, [user]);

  return { guests, isLoadingGuests, error };
}
