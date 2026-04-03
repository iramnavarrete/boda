"use client";
import { useEffect, useState } from "react";
import { GuestService } from "@/services/guestService";
import { Guest } from "@/types";
import { FirestoreErrorCode } from "firebase/firestore";

export function useGuestsData(invitationId?: string) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoadingGuests, setIsLoadingGuests] = useState(true);
  const [error, setError] = useState<FirestoreErrorCode | null>(null);

  useEffect(() => {
    let unsubscribe = () => {};
    if (invitationId) {
      unsubscribe = GuestService.subscribeToGuests(
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
    }
  }, [invitationId]);

  return { guests, isLoadingGuests, error };
}
