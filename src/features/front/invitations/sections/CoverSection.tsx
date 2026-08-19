import Cover from "@/features/front/components/siena/cover";
import type { CoverSectionProps } from "../shared/types";

/**
 * Sección: Portada con carrusel.
 *
 * Wrapper sobre `siena/cover`. Recibe los props del componente original
 * más `isSealVisible`, que controla el sello animado.
 */
export default function CoverSection(props: CoverSectionProps) {
  return <Cover {...props} />;
}
