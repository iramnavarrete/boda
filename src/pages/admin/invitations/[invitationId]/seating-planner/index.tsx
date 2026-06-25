import SeatingManager from "@/features/admin/seating/components/seating/SeatingManager";
import Loader from "@/features/front/components/Loader";
import AdminLayout from "@/features/shared/layouts/admin";
import { useRouter } from "next/router";

export default function AdminDashboard() {
  const router = useRouter();
  const invitationId = router.query.invitationId as string;

  if (!invitationId) {
    return <Loader fullscreen />;
  }
  return (
    <AdminLayout mainClassName="overflow-hidden" invitationId={invitationId}>
      <SeatingManager />
    </AdminLayout>
  );
}
