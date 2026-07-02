import { useState, useEffect } from "react";
import { FamilyActivity } from "@/types";
import { ActivityService } from "@/services/activityService";

export function useRecentActivities(invitationId: string | undefined, limitCount: number = 20) {
  const [activities, setActivities] = useState<FamilyActivity[]>([]);
  const [lastActivity, setLastActivity] = useState<FamilyActivity | null>(null);

  useEffect(() => {
    if (!invitationId) return;

    const unsubscribe = ActivityService.subscribeToRecentActivity(
      invitationId,
      limitCount,
      (data) => {
        setLastActivity(data[0] || null);
        setActivities(data);
      },
    );

    return () => unsubscribe();
  }, [invitationId, limitCount]);

  return { activities, lastActivity };
}
