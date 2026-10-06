import { XvInvitationPage, getInvitationProps } from "@/features/front/invitations";
import sofiaXvConfig from "@/features/front/invitations/configs/sofia-xv.config";
import type { Invitation } from "@/types";

interface PageProps {
  invitationData: Invitation & { eventUrl: string };
}

/**
 * Página pública de la invitación: Sofía · Mis XV Años.
 *
 * Usa el orquestador `XvInvitationPage` con la config `sofia-xv.config.tsx`.
 * El `getServerSideProps` compartido trae la invitación desde Firestore
 * y resuelve el `fechaISO` con zona horaria de Chihuahua.
 */
export default function SofiaXvPage(props: PageProps) {
  return <XvInvitationPage {...props} config={sofiaXvConfig} />;
}

export const getServerSideProps = getInvitationProps;