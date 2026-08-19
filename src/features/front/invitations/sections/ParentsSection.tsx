import ParentsGodFathers from "@/features/front/components/siena/parents";
import type { ParentsSectionProps } from "../shared/types";

/**
 * Sección: Padres de los novios + calendario + cuenta regresiva.
 *
 * El nombre del archivo (ParentsSection) y el del componente base
 * (ParentsGodFathers) son consistentes con la nomenclatura del repo.
 */
export default function ParentsSection(props: ParentsSectionProps) {
  return <ParentsGodFathers {...props} />;
}
