import GuestQuotesList from "@/features/admin/components/GuestQuotesList";
import Loader from "@/features/front/components/Loader";
import AdminLayout from "@/features/shared/layouts/admin";
import { useRouter } from "next/router";

export default function QuotesPage() {
  const router = useRouter();
  const invitationId = router.query.invitationId as string;

  if (!invitationId) {
    return <Loader fullscreen />;
  }
  return (
    <AdminLayout invitationId={invitationId}>
      <GuestQuotesList />
    </AdminLayout>
  );
}
