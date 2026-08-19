import AccomodationSectionBase from "@/features/front/components/siena/AccomodationSection";
import type { AccommodationConfig, AccommodationStyleConfig } from "@/features/front/components/siena/AccomodationSection";

export interface AccommodationSectionProps {
  config: AccommodationConfig;
  styles?: AccommodationStyleConfig;
}

/**
 * Sección: Hospedaje (hoteles, amenidades, contacto).
 *
 * Wrapper sobre `siena/AccomodationSection`. La config vive ahora como
 * un slot top-level de la invitación, no anidada en `dressCode`.
 */
export default function AccommodationSection(
  props: AccommodationSectionProps,
) {
  return (
    <AccomodationSectionBase
      config={props.config}
      styles={props.styles}
    />
  );
}

