import React, { Dispatch, SetStateAction } from "react";
import { Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import { FamilyActivity } from "@/types";
import { useRecentActivities } from "../hooks/useRecentActivities";
import { ACTIVITY_VISUAL } from "@/features/admin/activity/utils/activityLabels";
import {
  StatusIconCircle,
  TimeAgoStamp,
} from "@/features/admin/activity/components";
import DashboardCard from "./DashboardCard";

const ActivityItem: React.FC<{ activity: FamilyActivity }> = ({ activity }) => {
  const familyName = activity.familyName || activity.guestName || "Invitado";
  const visual = ACTIVITY_VISUAL[activity.action];
  // Lowercase del label para el estilo de frase del dashboard.
  const actionLabel = visual.label(activity).toLowerCase();

  return (
    <div className="flex items-start gap-4 p-3 hover:bg-[#FDFBF7] rounded-xl transition-colors border border-transparent hover:border-[#EBE5DA] group">
      <div className="transition-transform group-hover:scale-110">
        <StatusIconCircle action={activity.action} size="md" />
      </div>
      <div className="flex-1 pt-0.5">
        <p className="text-[13px] text-[#5A5A5A] leading-snug">
          <strong className="text-[#2C3627] font-bold">{`${familyName} `}</strong>
          {" "}
          {actionLabel}
        </p>
        <TimeAgoStamp
          timestamp={activity.timestamp}
          className="text-[10px] text-[#A8A29E] font-medium capitalize-first mt-1 block"
        />
      </div>
    </div>
  );
};

const MemoizedActivityItem = React.memo(ActivityItem);

interface RecentActivityCardProps {
  setLastActivity: Dispatch<SetStateAction<FamilyActivity | null>>;
  invitationId?: string;
  /** Ruta a la página completa de actividad. Si se omite, no se muestra el botón "Ver más". */
  activityRoute?: string;
}

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  setLastActivity,
  invitationId,
  activityRoute,
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
        <div className="h-full space-y-2 pb-2">
          {activities.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 text-xs italic text-center px-5">
              <span className="font-semibold">No hay actividad reciente.<br /></span>
              Los movimientos de tus invitados aparecerán aquí en tiempo real.
            </div>
          )}
          {activities.map((act) => (
            <MemoizedActivityItem key={act.id} activity={act} />
          ))}
        </div>
      </div>

      {/* Footer con "Ver más" — lleva al listado completo */}
      {activityRoute && (
        <div className="shrink-0 pt-1 mt-1 border-t border-[#EBE5DA]">
          <Link
            href={activityRoute}
            className="group flex items-center justify-center gap-1.5 w-full py-2 text-xs font-bold text-stone-500 hover:text-gold-600 uppercase tracking-widest transition-colors"
          >
            <span>Ver más</span>
            <ArrowRight
              size={13}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      )}
    </DashboardCard>
  );
};

export default React.memo(RecentActivityCard);