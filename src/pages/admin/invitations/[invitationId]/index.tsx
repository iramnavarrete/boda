import { useParams } from "next/navigation";
import Loader from "@/features/front/components/Loader";
import WeddingAdmin from "@/features/admin/components/WeddingAdmin";

export default function Index() {
  const params = useParams();
  const invitationId = params?.invitationId as string;
  if (!invitationId) {
    return <Loader fullscreen />;
  }
  return <WeddingAdmin invitationId={invitationId} />;
}
