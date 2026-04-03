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
import { GuestActivity } from "@/types";
import { GuestService } from "./guestService";

// --- SERVICIO ---
export const ActivityService = {
  /**
   * Guarda una nueva actividad (Público)
   * Úsalo en la página de la invitación o al enviar el formulario RSVP.
   */
  logActivity: async (
    invitationId: string,
    payload: Omit<GuestActivity, "id" | "timestamp" | "guestName">,
  ) => {
    if (!invitationId || !payload.guestId) return;

    const guest = await GuestService.getGuest(invitationId, payload.guestId);

    try {
      const activityRef = collection(
        db,
        "invitations",
        invitationId,
        "activity",
      );
      await addDoc(activityRef, {
        ...payload,
        guestName: guest.guest?.nombre,
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
    limitCount: number = 20,
    callback: (activities: GuestActivity[]) => void,
  ) => {
    const q = query(
      collection(db, "invitations", invitationId, "activity"),
      orderBy("timestamp", "desc"),
      limit(limitCount),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const activities = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as GuestActivity[];

        callback(activities);
      },
      (error) => {
        console.error("Error al escuchar la actividad:", error);
      },
    );

    return unsubscribe;
  },
};
