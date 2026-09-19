import { useRouter } from "next/router";
import Loader from "@/features/front/components/Loader";
import ActivityAdmin from "@/features/admin/activity/components/ActivityAdmin";
import AdminLayout from "@/features/shared/layouts/admin";

export default function ActivityPage() {
  const router = useRouter();
  const invitationId = router.query.invitationId as string;

  if (!invitationId) {
    return <Loader fullscreen />;
  }

  return (
    <AdminLayout invitationId={invitationId}>
      <ActivityAdmin />
    </AdminLayout>
  );
}