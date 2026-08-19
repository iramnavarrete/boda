import { InvitationPage, getInvitationProps } from "@/features/front/invitations";
import config from "@/features/front/invitations/configs/melissa-santiago.config";
import type { Invitation } from "@/types";

interface PageProps {
  invitationData: Invitation & { eventUrl: string };
}

export default function MelissaSantiagoPage(props: PageProps) {
  return <InvitationPage {...props} config={config} />;
}

export const getServerSideProps = getInvitationProps;
