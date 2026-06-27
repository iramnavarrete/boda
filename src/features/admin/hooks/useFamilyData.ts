"use client";
import { useEffect, useState } from "react";
import { FamiliesService } from "@/services/familiesService";
import { Family } from "@/types";
import { FirestoreErrorCode } from "firebase/firestore";

export function useFamiliesData(invitationId?: string) {
  const [families, setFamlilies] = useState<Family[]>([]);
  const [isLoadingFamilies, setIsLoadingFamilies] = useState(true);
  const [error, setError] = useState<FirestoreErrorCode | null>(null);

  useEffect(() => {
    let unsubscribe = () => {};
    if (invitationId) {
      unsubscribe = FamiliesService.subscribeToFamilies(
        invitationId,
        (data) => {
          setFamlilies(data);
          setIsLoadingFamilies(false);
        },
        (error) => {
          setFamlilies([]);
          setIsLoadingFamilies(false);
          setError(error.code);
        },
      );
      return unsubscribe;
    }
  }, [invitationId]);

  return { families, isLoadingFamilies, error };
}
