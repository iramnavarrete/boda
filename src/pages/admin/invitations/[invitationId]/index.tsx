import { useParams } from "next/navigation";
import Loader from "@/features/front/components/Loader";
import WeddingAdmin from "@/features/admin/components/WeddingAdmin";
import AdminLayout from "@/features/shared/layouts/admin";
import { useEffect } from "react";
import { InvitationsService } from "@/services/invitationsService";
import { useInvitationStore } from "@/features/front/stores/invitationStore";

export default function Index() {
  const params = useParams();
  const invitationId = params?.invitationId as string;
  useEffect(() => {
    if (invitationId) {
      const fetchInvitationData = async () => {
        const { invitation: invitationData } =
          await InvitationsService.getInvitation(invitationId);
        useInvitationStore.setState({ invitationData });
      };
      fetchInvitationData();
    }
  }, [invitationId]);

  if (!invitationId) {
    return <Loader fullscreen />;
  }
  return (
    <AdminLayout>
      <WeddingAdmin invitationId={invitationId} />
    </AdminLayout>
  );
}
