import ProtectedPage from "@/features/admin/components/ProtectedPage";
import WeddingAdmin from "@/features/front/components/WeddingAdmin";

export default function WeddingAdminPanel() {

  return (
    <ProtectedPage>
      <WeddingAdmin />
    </ProtectedPage>
  );
}
