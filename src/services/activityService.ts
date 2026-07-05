import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { FamilyActivity } from "@/types";
import { invitationsCollectionName } from "./invitationsService";

// --- SERVICIO ---
export const ActivityService = {
  /**
   * Guarda una nueva actividad (Público)
   * Úsalo en la página de la invitación o al enviar el formulario RSVP.
   */
  logActivity: async (
    invitationId: string,
    // 🔥 Ahora omitimos el "familyName" del Omit, lo que significa que es OBLIGATORIO enviarlo en el payload
    payload: Omit<FamilyActivity, "id" | "timestamp">,
  ) => {
    if (!invitationId || !payload.familyId || !payload.familyName) return;

    try {
      const activityRef = collection(
        db,
        invitationsCollectionName,
        invitationId,
        "activity",
      );
      // 🔥 Guardamos directo sin hacer getDoc()
      await addDoc(activityRef, {
        ...payload,
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
    limitCount: number | undefined,
    callback: (activities: FamilyActivity[]) => void,
  ) => {
    const queryConstraints: QueryConstraint[] = [orderBy("timestamp", "desc")];

    if (limitCount !== undefined && limitCount > 0) {
      queryConstraints.push(limit(limitCount));
    }

    const q = query(
      collection(db, invitationsCollectionName, invitationId, "activity"),
      ...queryConstraints,
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
