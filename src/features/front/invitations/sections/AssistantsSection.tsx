import Assistants from "@/features/front/components/siena/Assistants";
import type { AssistantsSectionProps } from "../shared/types";

/** Sección: Confirmación de asistencia (familias). */
export default function AssistantsSection(props: AssistantsSectionProps) {
  return <Assistants {...props} />;
}
