"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useFamilyContext } from "@/features/front/components/FamilyContext";
import { FamiliesService } from "@/services/familiesService";
import { ActivityService } from "@/services/activityService";

interface UseInvitationViewTrackingOptions {
  /**
   * Si `true`, se dispara el `logActivity` + `markInvitationAsViewed`.
   * Típicamente se ata al flag `isEnvelopeOpened` del sobre — solo cuando
   * el invitado abre el sello se considera que "vio" la invitación.
   */
  enabled: boolean;
  /**
   * ID de la invitación a la que pertenece la familia. Si no se
   * proporciona, el hook no hace nada (modo seguro si el caller lo
   * llama antes de tiempo).
   */
  invitationId: string | null | undefined;
}

/**
 * Hook compartido para registrar la vista de una invitación.
 *
 * Misma semántica para bodas y XV Años:
 *  - Lee la familia del `FamilyContext` actual
 *  - Si `enabled === true` y hay familia + no es preview, hace UNA
 *    sola vez (useRef guard contra React strict mode):
 *      1. `ActivityService.logActivity("view", ...)` → queda en el
 *         log de actividad de la invitación (visible en admin)
 *      2. `FamiliesService.markInvitationAsViewed(...)` → marca
 *         `invitacionVista: true` en el doc de la familia
 *
 * URLs con `?preview=...` o `?token=...` se IGNORAN — son links
 * especiales (preview de admin, link firmado de check-in) que no
 * deben disparar vista real.
 *
 * Comportamiento idempotente: si la familia ya tiene
 * `invitacionVista: true`, sólo se hace el `logActivity` (la marca
 * se omite vía el chequeo `if (!family.invitacionVista)`).
 */
export function useInvitationViewTracking({
  enabled,
  invitationId,
}: UseInvitationViewTrackingOptions): void {
  const { family, setFamily } = useFamilyContext();
  const searchParams = useSearchParams();
  const preview = searchParams?.get("preview");

  // Ref para evitar doble-log en React strict mode (dev re-renderiza
  // effects una segunda vez en mount para detectar side-effects impuros).
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    // Guard común: no disparar si no aplica.
    if (!enabled) return;
    if (!invitationId) return;
    if (!family) return;
    if (preview) return; // preview del admin
    if (hasLoggedRef.current) return;

    hasLoggedRef.current = true;

    // 1. Loguear en el activity log del admin
    ActivityService.logActivity(invitationId, {
      action: "view",
      familyId: family.id,
      familyName: family.nombre,
    }).catch(console.error);

    // 2. Marcar la familia como vista (idempotente — si ya estaba
    // marcada, sólo actualizamos el state local sin pegar a Firestore).
    if (!family.invitacionVista) {
      FamiliesService.markInvitationAsViewed(invitationId, family.id).catch(
        console.error,
      );
      setFamily((prev) => (prev ? { ...prev, invitacionVista: true } : prev));
    }
  }, [enabled, invitationId, family, preview, setFamily]);
}
