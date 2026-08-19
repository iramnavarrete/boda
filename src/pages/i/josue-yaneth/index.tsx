import { InvitationPage, getInvitationProps } from "@/features/front/invitations";
import config from "@/features/front/invitations/configs/josue-yaneth.config";
import type { Invitation } from "@/types";

interface PageProps {
  invitationData: Invitation & { eventUrl: string };
}

export default function JosueYanethPage(props: PageProps) {
  return <InvitationPage {...props} config={config} />;
}

export const getServerSideProps = getInvitationProps;
