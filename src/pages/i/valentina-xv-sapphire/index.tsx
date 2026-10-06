import { XvInvitationPage, getInvitationProps } from "@/features/front/invitations";
import valentinaXvConfig from "@/features/front/invitations/configs/valentina-xv-sapphire.config";
import type { Invitation } from "@/types";

interface PageProps {
  invitationData: Invitation & { eventUrl: string };
}

/**
 * Página pública de la invitación: Valentina · Mis XV Años — variante SAPPHIRE.
 *
 * Mismo orquestador `XvInvitationPage` que Sofía, pero con un config
 * que activa `theme: "sapphire"`. Las CSS variables hacen el resto.
 */
export default function ValentinaXvSapphirePage(props: PageProps) {
  return <XvInvitationPage {...props} config={valentinaXvConfig} />;
}

export const getServerSideProps = getInvitationProps;