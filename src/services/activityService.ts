import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  QueryConstraint,
  FirestoreError,
  Unsubscribe,
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
      await addDoc(activityRef, {
        ...payload,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error registrando actividad:", error);
    }
  },

  /**
   * Suscripción en tiempo real a TODA la actividad de una invitación (Admin).
   *
   * Usa `onSnapshot` con `orderBy("timestamp", "desc")` para mantener el
   * orden cronológico inverso automáticamente. Si se pasa `options.limit`,
   * trunca al más reciente (útil para previews como el dashboard).
   *
   * Devuelve una función de cleanup para `useEffect`.
   */
  subscribeToActivity: (
    invitationId: string,
    options: { limit?: number } | undefined,
    callback: (activities: FamilyActivity[]) => void,
    onError?: (error: FirestoreError) => void,
  ): Unsubscribe => {
    if (!invitationId) return () => {};

    const queryConstraints: QueryConstraint[] = [
      orderBy("timestamp", "desc"),
    ];
    if (options?.limit !== undefined && options.limit > 0) {
      queryConstraints.push(limit(options.limit));
    }

    return onSnapshot(
      query(
        collection(db, invitationsCollectionName, invitationId, "activity"),
        ...queryConstraints,
      ),
      (snapshot) => {
        const activities = snapshot.docs.map((docSnap) => {
          const data = docSnap.data({ serverTimestamps: "estimate" });
          return {
            id: docSnap.id,
            familyId: data.familyId,
            familyName: data.familyName,
            guestName: data.guestName,
            action: data.action,
            confirmedGuests: data.confirmedGuests,
            timestamp: data.timestamp,
          } as FamilyActivity;
        });
        callback(activities);
      },
      (error) => {
        if (onError) onError(error);
        else console.error("Error al escuchar la actividad:", error);
      },
    );
  },

  /**
   * Variante con límite por defecto (compatibilidad con el dashboard).
   * Internamente delega en `subscribeToActivity`.
   */
  subscribeToRecentActivity: (
    invitationId: string,
    limitCount: number | undefined,
    callback: (activities: FamilyActivity[]) => void,
    onError?: (error: FirestoreError) => void,
  ): Unsubscribe => {
    return ActivityService.subscribeToActivity(
      invitationId,
      { limit: limitCount },
      callback,
      onError,
    );
  },
};