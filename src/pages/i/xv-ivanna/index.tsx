import { XvInvitationPage, getInvitationProps } from "@/features/front/invitations";
import xvIvannaConfig from "@/features/front/invitations/configs/xv-ivanna.config";
import type { Invitation } from "@/types";

interface PageProps {
  invitationData: Invitation & { eventUrl: string };
}

/**
 * Página pública de la invitación: Ivanna · Mis XV Años.
 *
 * Usa el orquestador `XvInvitationPage` con la config `xv-ivanna.config.tsx`
 * (variante SAPPHIRE — clonada de valentina-xv-sapphire). Los datos
 * editables (padres, padrinos, fecha, etc.) se leen desde Firestore
 * vía `getServerSideProps`; el config aporta theme + defaults visuales.
 */
export default function XvIvannaPage(props: PageProps) {
  return <XvInvitationPage {...props} config={xvIvannaConfig} />;
}

export const getServerSideProps = getInvitationProps;