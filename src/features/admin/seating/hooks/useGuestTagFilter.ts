import { useState } from "react";
import { TagFilterType } from "@/types";
import { getEtiquetaOptions } from "@/features/admin/utils/etiquetaPorTipo";
import { useInvitationStore } from "@/features/front/stores/invitationStore";

/**
 * Hook de estado local del filtro de tags en el seating planner.
 *
 * Type-aware: las opciones válidas dependen del `tipo` de la invitación
 * (boda: Novia/Novio/Ambos, XV: Fam. Paterna/Fam. Materna/Amgos/Otros).
 *
 * Mantiene la misma firma `{ tagFilter, setTagFilter, options }` para
 * compatibilidad con `useGuestAssignment` y `useGuestView` (ambos
 * comparan `f.rawFamily.etiqueta !== tagFilter`, que funciona con
 * cualquier string del registry).
 */
export function useGuestTagFilter() {
  const tipo = useInvitationStore((s) => s.invitationData?.tipo);
  const specs = getEtiquetaOptions(tipo);

  const [tagFilter, setTagFilter] = useState<TagFilterType>("all");

  return {
    tagFilter,
    setTagFilter,
    /** Specs de etiquetas disponibles para el tipo actual. */
    options: specs,
    /** Tipo de invitación actual (boda/xv_anos/...). */
    tipo,
  };
}