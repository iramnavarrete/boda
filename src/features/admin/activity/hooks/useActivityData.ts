"use client";

import { useEffect, useState } from "react";
import type { FamilyActivity } from "@/types";
import { ActivityService } from "@/services/activityService";
import { useInvitationStore } from "@/features/front/stores/invitationStore";

/**
 * Hook de carga de actividades desde Firestore en tiempo real.
 *
 * Suscribe a `invitations/{id}/activity` ordenando por `timestamp desc`.
 * El callback de `onSnapshot` se invoca en cada cambio:
 * - Primer snapshot → marca `hasLoaded=true` → `isLoading=false`
 * - Cambios subsecuentes → solo actualiza activities
 *
 * **Estados de `isLoading`**:
 * - `invitationId` undefined → `false` (silencioso, empty state)
 * - `invitationId` definido y sin snapshot aún → `true` (loader)
 * - `invitationId` definido y snapshot recibido → `false`
 *
 * Implementación: usamos el patrón "Adjusting state when prop changes" de
 * React 19 (setState durante render para detectar cambio de invitationId).
 * `setState` dentro de useEffect dispara la regla `react-hooks/set-state-in-effect`.
 */
export function useActivityData() {
  const invitationId = useInvitationStore(
    (state) => state.invitationData?.id,
  );

  const [activities, setActivities] = useState<FamilyActivity[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [prevInvitationId, setPrevInvitationId] = useState<string | undefined>(
    invitationId,
  );

  // Detectar cambio de invitationId → reset de estado antes de re-suscribir.
  // Patrón "Adjusting state on prop change" de React 19.
  if (invitationId !== prevInvitationId) {
    setPrevInvitationId(invitationId);
    setHasLoaded(false);
    setActivities([]);
    setError(null);
  }

  // isLoading derivado: solo true cuando hay invitationId y aún no hay snapshot
  const isLoading = !!invitationId && !hasLoaded;

  useEffect(() => {
    if (!invitationId) return;

    const unsubscribe = ActivityService.subscribeToActivity(
      invitationId,
      undefined, // sin límite — el admin quiere ver todo
      (data) => {
        setActivities(data);
        setHasLoaded(true);
      },
      (err) => {
        setError(err as unknown as Error);
        setHasLoaded(true); // sale de loading aunque haya error
      },
    );

    return () => unsubscribe();
  }, [invitationId]);

  return { activities, isLoading, error };
}