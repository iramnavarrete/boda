import React, { Dispatch, SetStateAction } from "react";
import { Activity, Eye, CheckCircle2, XCircle } from "lucide-react";
import { FamilyActivity } from "@/types";
import { useTimeAgo } from "@/features/shared/hooks/useTimeAgo";
import { useRecentActivities } from "../hooks/useRecentActivities";
import DashboardCard from "./DashboardCard";

const ActivityItem: React.FC<{ activity: FamilyActivity }> = ({ activity }) => {
  const familyName = activity.familyName || activity.guestName || "Invitado";
  const timeAgo = useTimeAgo(activity.timestamp);

  let config = {
    icon: <Eye size={14} />,
    text: "vio la invitación",
    bgColor: "bg-stone-100",
    iconColor: "text-stone-500",
  };

  if (activity.action === "confirm") {
    config = {
      icon: <CheckCircle2 size={14} />,
      text: `confirmó asistencia${activity.confirmedGuests ? ` de ${activity.confirmedGuests} invitado${activity.confirmedGuests === 1 ? "" : "s"}` : ""}`,
      bgColor: "bg-[#E7F3EF]",
      iconColor: "text-[#2D5B4F]",
    };
  } else if (activity.action === "decline") {
    config = {
      icon: <XCircle size={14} />,
      text: "declinó la invitación",
      bgColor: "bg-[#F9EAE9]",
      iconColor: "text-[#853935]",
    };
  }
  return (
    <div className="flex items-start gap-4 p-3 hover:bg-[#FDFBF7] rounded-xl transition-colors border border-transparent hover:border-[#EBE5DA] group">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-black/5 group-hover:scale-110 transition-transform ${config.bgColor} ${config.iconColor}`}
      >
        {config.icon}
      </div>
      <div className="flex-1 pt-0.5">
        <p className="text-[13px] text-[#5A5A5A] leading-snug">
          <strong className="text-[#2C3627] font-bold">
            {`${familyName} `}
          </strong>{" "}
          {config.text}
        </p>
        <span className="text-[10px] text-[#A8A29E] font-medium capitalize-first mt-1 block">
          {timeAgo}
        </span>
      </div>
    </div>
  );
};

const MemoizedActivityItem = React.memo(ActivityItem);

interface RecentActivityCardProps {
  setLastActivity: Dispatch<SetStateAction<FamilyActivity | null>>;
  invitationId?: string;
}

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  setLastActivity,
  invitationId,
}) => {
  const { activities, lastActivity } = useRecentActivities(invitationId, 20);

  // Sincroniza la última actividad hacia arriba para la tarjeta Hero
  React.useEffect(() => {
    setLastActivity(lastActivity);
  }, [lastActivity, setLastActivity]);

  return (
    <DashboardCard
      icon={Activity}
      title="Actividad Reciente"
      subtitle="Últimos movimientos"
      className="h-96 lg:h-full"
      headerRight={
        <span className="text-[9px] font-bold text-[#C5A669] bg-[#FDFBF7] border border-[#EBE5DA] px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5A669] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C5A669]"></span>
          </span>
          En Vivo
        </span>
      }
    >
      <div className="flex-1 overflow-y-auto pr-2 -mx-2 px-2 min-h-0">
        <div className="space-y-2 pb-2">
          {activities.map((act) => (
            <MemoizedActivityItem key={act.id} activity={act} />
          ))}
        </div>
      </div>
    </DashboardCard>
  );
};

export default React.memo(RecentActivityCard);
