import type { ReactNode } from "react";
import CeremonyToast from "@/features/front/components/siena/ceremony-toast";
import type { DressCodeSectionProps } from "../shared/types";

/**
 * Sección: Logística del evento + dress code.
 *
 * Internamente se renderiza con `CeremonyToast`, que agrupa:
 *  - Ceremonia religiosa (EditorialEvent)
 *  - Recepción (EditorialEvent)
 *  - Hospedaje opcional (vía `accommodationSlot`)
 *  - Nota "no se servirá cena" (opcional)
 *  - Timeline itinerario (vía `timelineSlot`)
 *  - Dress code (DressCode) con paleta prohibida
 *
 * Hospedaje y timeline se pasan como **slots** desde el orquestador,
 * no como props anidadas. Eso permite que cada invitación defina su
 * config en slots top-level independientes.
 */
export interface DressCodeSectionSlots {
  accommodationSlot?: ReactNode;
  timelineSlot?: ReactNode;
}

export default function DressCodeSection({
  accommodationSlot,
  timelineSlot,
  ...ceremonyProps
}: DressCodeSectionProps & DressCodeSectionSlots) {
  return (
    <CeremonyToast
      {...ceremonyProps}
      accommodationSlot={accommodationSlot}
      timelineSlot={timelineSlot}
    />
  );
}
