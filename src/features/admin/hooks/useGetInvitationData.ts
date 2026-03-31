"use client";
import { useEffect, useState } from "react";
import { InvitationsService } from "@/services/invitationsService";
import { Invitation } from "@/types";

export function useGetInvitationData(invitationId: string) {
  const [invitationData, setInvitationData] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvitations = async () => {
      const invitation = await InvitationsService.getInvitation(invitationId);
      setInvitationData(invitation);
      setIsLoading(false);
    };
    fetchInvitations();
  }, []);

  return { invitationData, isLoading };
}
