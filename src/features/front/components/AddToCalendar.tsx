import { cn } from "@heroui/theme";
import { useInvitationStore } from "../stores/invitationStore";
import {
  openCalendarEvent,
  type CalendarEventInput,
} from "../utils/addToCalendar";
import { ArrowRight } from "lucide-react";

/**
 * AddToCalendar — botón de "Agregar al Calendario" para invitaciones de boda.
 *
 * Detecta dinámicamente el proveedor (Google / Apple / Outlook) y abre
 * el evento con título/desc/ubicación/fechas ya prellenados.
 *
 * DRY: la lógica de detección + armado de URL/.ics vive en
 * `../utils/addToCalendar.ts` — la misma función la consume
 * `xv-anos/CountDownBox.tsx` para que cualquier fix (Outlook 365, ICS
 * webcal://, duración custom, etc.) impacte ambas secciones a la vez.
 */
export default function AddToCalendar({
  addToCalendarBtnClassName = "",
}: {
  addToCalendarBtnClassName?: string;
}) {
  // Extraemos la información directamente desde Zustand
  const invitationData = useInvitationStore((state) => state.invitationData);

  // Si por alguna razón la información aún no carga, no renderizamos
  if (!invitationData || !invitationData.fechaISO) return null;

  const handleClick = () => {
    // Cast seguro: ya validamos `fechaISO` arriba. El store lo expone
    // opcional, pero `openCalendarEvent` lo requiere para construir
    // las fechas — la guard previa garantiza la invariante.
    openCalendarEvent(invitationData as unknown as CalendarEventInput);
  };

  return (
    <button
      className={cn(
        "flex items-center gap-2 text-[10px] font-nourdMedium text-primary uppercase tracking-[0.2em] border-b border-primary/20 pb-1 hover:border-primary transition-all",
        addToCalendarBtnClassName,
      )}
      onClick={handleClick}
    >
      Agregar al Calendario{" "}
      <ArrowRight
        size={12}
        className="opacity-70 group-hover:translate-x-1 transition-transform"
      />
    </button>
  );
}