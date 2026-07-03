import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useInvitationStore } from "@/features/front/stores/invitationStore";
import { useFamiliesData } from "../hooks/useFamilyData";
import { useTimeAgo } from "@/features/shared/hooks/useTimeAgo";
import Loader from "@/features/front/components/Loader";
import { useToast } from "@/features/shared/components/Toast";
import { FamilyActivity } from "@/types";

// Componentes del Módulo
import EventHeroCard from "./components/EventHeroCard";
import RecentActivityCard from "./components/RecentActivityCard";
import MessagesCard from "./components/MessagesCard";
import CountdownCard from "./components/CountdownCard";
import { formatToEventDate, getEventTypeName } from "@/utils/formatters";
import { SeatingElement } from "../seating/stores/useSeatingStore";
import { SeatingService } from "../seating/services/seatingService";
import { useEventStats } from "../hooks/useEventStats";
import UnifiedStatsCard from "./components/UnifiedStatsCard";
import { ActivityService } from "@/services/activityService";

export default function InvitationDashboard() {
  const [lastActivity, setLastActivity] = useState<FamilyActivity | null>(null);
  const [elements, setElements] = useState<SeatingElement[]>([]);
  const [activities, setActivities] = useState<FamilyActivity[]>([]);
  const { toast } = useToast();

  const timeAgo = useTimeAgo(lastActivity?.timestamp);
  const router = useRouter();
  const invitationData = useInvitationStore((state) => state.invitationData);

  const { isLoadingFamilies, families, error } = useFamiliesData(
    invitationData?.id,
  );

  useEffect(() => {
    if (invitationData?.id) {
      SeatingService.getPlan(invitationData.id)
        .then((planElements) => setElements(planElements))
        .catch(console.error);
    }
  }, [invitationData?.id]);

  useEffect(() => {
    if (!invitationData?.id) return;
    const fetchViewedFamilies = async () => {
      try {
        ActivityService.subscribeToRecentActivity(invitationData.id, undefined, (activities) => {
          setActivities(activities);
        });
      } catch (error) {
        console.error("Error al obtener vistas:", error);
      }
    };
    fetchViewedFamilies();
  }, [invitationData?.id]);

  const stats = useEventStats(families || [], {elements, activities});

  useEffect(() => {
    if (error) {
      if (error === "permission-denied" || error === "unauthenticated") {
        router.replace("/admin/invitations");
      } else {
        toast("Ocurrió un error", "error");
      }
    }
  }, [error, router, toast]);

  if (isLoadingFamilies) return <Loader fullscreen />;

  if (error === "permission-denied") return null;

  return (
    <div className="min-h-screen bg-[#F9F7F2] p-4 md:px-6 py-6 md:py-8 space-y-8 font-sans">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <EventHeroCard
          timeAgo={timeAgo}
          eventDate={formatToEventDate(
            invitationData?.fecha.toDate() || new Date(),
          )
            .split("/")[1]
            .trim()}
          eventName={
            `${getEventTypeName(invitationData?.tipo || "")} de ${invitationData?.nombre}` ||
            "Nombre del evento"
          }
          eventLocation={invitationData?.ubicacion || "Ubicación del evento"}
          familiesRoute={`/admin/invitations/${invitationData?.id}`}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch lg:h-96">
          <div className="lg:col-span-1 flex flex-col min-h-0">
            <RecentActivityCard
              invitationId={invitationData?.id}
              setLastActivity={setLastActivity}
            />
          </div>
          <div className="lg:col-span-2 flex flex-col min-h-0">
            {/* 3. Inyectamos los cálculos en la tarjeta unificada */}
            <UnifiedStatsCard stats={stats.stats} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 flex flex-col min-h-0">
            <MessagesCard />
          </div>
          <div className="lg:col-span-5 flex flex-col min-h-0">
            {invitationData?.imagenPortada && (
              <CountdownCard
                targetDate={
                  invitationData?.fecha
                    ? invitationData.fecha.toDate()
                    : undefined
                }
                srcCover={invitationData.imagenPortada}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
