import { InvitationPage, getInvitationProps } from "@/features/front/invitations";
import config from "@/features/front/invitations/configs/andrea-adrian.config";
import type { Invitation } from "@/types";

interface PageProps {
  invitationData: Invitation & { eventUrl: string };
}

export default function AndreaAdrianPage(props: PageProps) {
  return <InvitationPage {...props} config={config} />;
}

export const getServerSideProps = getInvitationProps;
