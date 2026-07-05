import { WeddingAdminProvider } from "@/features/admin/context/WeddingAdminContext";
import { WeddingAdminLayout } from "@/features/admin/components/WeddingAdminLayout";
import { WeddingAdminModals } from "@/features/admin/components/modals/WeddingAdminModals";

export default function WeddingAdmin() {
  return (
    <WeddingAdminProvider>
      <WeddingAdminLayout />
      <WeddingAdminModals />
    </WeddingAdminProvider>
  );
}
