import UserDashboard from "@/features/admin/components/UsersDashboard";
import RootAdminLayout from "@/features/shared/layouts/rootAdmin";

export default function UsersIndex() {
  return (
    <RootAdminLayout>
      <UserDashboard />
    </RootAdminLayout>
  );
}