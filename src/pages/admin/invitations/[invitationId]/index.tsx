import { useParams } from "next/navigation";
import Loader from "@/features/front/components/Loader";
import WeddingAdmin from "@/features/admin/components/WeddingAdmin";
import AdminLayout from "@/features/shared/layouts/admin";

export default function Index() {
  const params = useParams();
  const invitationId = params?.invitationId as string;
  if (!invitationId) {
    return <Loader fullscreen />;
  }
  return (
    <AdminLayout>
      <WeddingAdmin invitationId={invitationId} />
    </AdminLayout>
  );
}
