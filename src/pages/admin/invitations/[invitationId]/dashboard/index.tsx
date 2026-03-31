import InvitationDashboard from "@/features/admin/components/InvitationDashboard";
import { useGetInvitationData } from "@/features/admin/hooks/useGetInvitationData";
import Loader from "@/features/front/components/Loader";
import AdminLayout from "@/features/shared/layouts/admin";
import { useRouter } from "next/router";

export default function AdminDashboard() {
  const router = useRouter();
  const invitationId = router.query.invitationId as string;
  const { invitationData } = useGetInvitationData(invitationId);

  if (!invitationId) {
    return <Loader fullscreen />;
  }
  return (
    <AdminLayout invitationData={invitationData}>
      <InvitationDashboard invitationId={invitationId} invitationData={invitationData} />
    </AdminLayout>
  );
}
