import { useParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export const useEventPermissions = (explicitInvitationId?: string) => {
  const params = useParams();
  const urlInvitationId = params?.invitationId as string | undefined;
  const targetId = explicitInvitationId || urlInvitationId;

  // Leemos la info centralizada de Zustand
  const getUserRole = useAuthStore((state) => state.getUserRole);
  const isRootAdmin = useAuthStore((state) => !!state.user?.isRootAdmin);

  // Obtenemos el rol exacto
  const role = getUserRole(targetId);

  // Derivamos todos los permisos posibles pre-calculados
  const isAdmin = role === "admin" || isRootAdmin;
  const isHost = role === "host";
  const isGuardia = role === "guardia";
  const isAdminOrHost = isAdmin || isHost;

  return {
    role,
    isAdmin,
    isHost,
    isGuardia,
    isAdminOrHost,
    canEditEventDetails: isAdmin,
    canDeleteGuests: isAdminOrHost,
    canSendWhatsapp: isAdminOrHost,
  };
};
