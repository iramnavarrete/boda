import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { FamilyActivity } from "@/types";
import { FamiliesService } from "./familiesService";
import { invitationsCollectionName } from "./invitationsService";

// --- SERVICIO ---
export const ActivityService = {
  /**
   * Guarda una nueva actividad (Público)
   * Úsalo en la página de la invitación o al enviar el formulario RSVP.
   */
  logActivity: async (
    invitationId: string,
    payload: Omit<FamilyActivity, "id" | "timestamp" | "familyName">,
  ) => {
    if (!invitationId || !payload.familyId) return;

    const family = await FamiliesService.getFamily(
      invitationId,
      payload.familyId,
    );

    try {
      const activityRef = collection(
        db,
        invitationsCollectionName,
        invitationId,
        "activity",
      );
      await addDoc(activityRef, {
        ...payload,
        familyName: family.family?.nombre,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error registrando actividad:", error);
    }
  },

  /**
   * Se suscribe a la actividad reciente (Privado - Admin)
   * Devuelve los últimos X registros en tiempo real.
   */
  subscribeToRecentActivity: (
    invitationId: string,
    limitCount: number = 30,
    callback: (activities: FamilyActivity[]) => void,
  ) => {
    const q = query(
      collection(db, invitationsCollectionName, invitationId, "activity"),
      orderBy("timestamp", "desc"),
      limit(limitCount),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const activities = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as FamilyActivity[];

        callback(activities);
      },
      (error) => {
        console.error("Error al escuchar la actividad:", error);
      },
    );

    return unsubscribe;
  },
};
