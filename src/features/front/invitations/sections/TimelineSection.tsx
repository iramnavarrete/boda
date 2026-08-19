import GraphicTimeline from "@/features/front/components/siena/EditorialTimeline";
import type {
  GraphicTimelineItem,
  TimelineStyleConfig,
} from "@/features/front/components/siena/EditorialTimeline";

export interface TimelineSectionProps {
  items: GraphicTimelineItem[];
  title?: string;
  subtitle?: string;
  styles?: TimelineStyleConfig;
  accentColor?: string;
}

/**
 * Sección: Timeline / Itinerario del evento.
 *
 * Wrapper sobre `siena/EditorialTimeline`. La config vive ahora como un
 * slot top-level de la invitación, no anidada en `dressCode`.
 */
export default function TimelineSection(props: TimelineSectionProps) {
  return <GraphicTimeline {...props} />;
}
