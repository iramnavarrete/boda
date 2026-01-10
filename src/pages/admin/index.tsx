import ProtectedPage from "../ProtectedPage";
import WeddingAdminPage from "./page";

export default function WeddingAdminPanel() {

  return (
    <ProtectedPage>
      <WeddingAdminPage />
    </ProtectedPage>
  );
}
