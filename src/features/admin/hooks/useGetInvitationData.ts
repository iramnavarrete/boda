"use client";
import { useEffect, useState } from "react";
import { InvitationsService } from "@/services/invitationsService";
import { Invitation } from "@/types";

export function useGetInvitationData(invitationId: string) {
  const [invitationData, setInvitationData] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>();

  useEffect(() => {
    const fetchInvitations = async () => {
      const { invitation, error } =
        await InvitationsService.getInvitation(invitationId);
      setInvitationData(invitation);
      setIsLoading(false);
      setError(error);
    };
    fetchInvitations();
  }, []);

  return { invitationData, isLoading, error };
}
