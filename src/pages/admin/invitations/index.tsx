import InvitationsListPage from "@/features/admin/components/InvitationsList";
import RootAdminLayout from "@/features/shared/layouts/rootAdmin";

export default function AdminInvitations() {
  return (
    <RootAdminLayout>
      <InvitationsListPage />;
    </RootAdminLayout>
  );
}
