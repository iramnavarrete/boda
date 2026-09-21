import { MailOpen, CheckCircle2, XCircle, type LucideIcon } from "lucide-react";
import type { ActivityActionType, FamilyActivity } from "@/types";
import type { ActivityFilterType } from "../types";

/**
 * Función que genera el texto del item de actividad.
 * Puede ser estática (mismo texto siempre) o dinámica (depende del record,
 * ej. incluir `confirmedGuests`).
 */
export type ActivityLabelFn = (activity: FamilyActivity) => string;

/**
 * Mapeo centralizado de `ActivityActionType` a la configuración visual usada
 * en cards y filtros. Replica el patrón de `RecentActivityCard` para mantener
 * el mismo lenguaje visual en toda la app.
 *
 * `label` es ahora una función que recibe la actividad completa — esto
 * permite componer textos dinámicos como "Confirmó asistencia de 2 invitados"
 * usando `confirmedGuests` del propio registro.
 */
export interface ActivityVisualConfig {
  /** Texto que aparece como título del item en la card (dinámico). */
  label: ActivityLabelFn;
  /** Texto corto para badges de filtro (ej: "En espera"). Estático. */
  shortLabel: string;
  icon: LucideIcon;
  /** Clases Tailwind para el círculo/icono contenedor del item. */
  iconBgClass: string;
  iconColorClass: string;
  /** Clases Tailwind para el badge de estado (chip). */
  badgeClass: string;
  /**
   * Clases Tailwind para el highlight del trigger del dropdown cuando este
   * filtro está activo y el dropdown está cerrado. Permite asignar un
   * color distintivo a cada filtro (verde para confirm, rojo para decline,
   * ámbar para unanswered, etc.) para que en móvil el usuario distinga
   * claramente qué filtro está aplicado.
   */
  triggerActiveClass: string;
}

export const ACTIVITY_VISUAL: Record<ActivityActionType, ActivityVisualConfig> =
  {
    view: {
      label: () => "Abrió la invitación",
      shortLabel: "Vistas",
      icon: MailOpen,
      iconBgClass: "bg-stone-100",
      iconColorClass: "text-stone-500",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      triggerActiveClass: "border-stone-400 bg-stone-100",
    },
    confirm: {
      label: (a) => {
        const n = a.confirmedGuests;
        if (!n || n <= 0) return "Confirmó asistencia";
        const suffix = n === 1 ? "invitado" : "invitados";
        return `Confirmó asistencia de ${n} ${suffix}`;
      },
      shortLabel: "Confirmaciones",
      icon: CheckCircle2,
      iconBgClass: "bg-emerald-100",
      iconColorClass: "text-emerald-600",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      triggerActiveClass: "border-emerald-400 bg-emerald-50/70",
    },
    decline: {
      label: () => "Declinó la invitación",
      shortLabel: "Rechazos",
      icon: XCircle,
      iconBgClass: "bg-red-100",
      iconColorClass: "text-red-600",
      badgeClass: "bg-red-50 text-red-700 border-red-200",
      triggerActiveClass: "border-red-300 bg-red-50/70",
    },
  };

/** Mapeo del filtro UI a la `action` real del modelo. */
export const FILTER_TO_ACTION: Record<
  Exclude<ActivityFilterType, "all" | "unanswered">,
  ActivityActionType
> = {
  confirm: "confirm",
  view: "view",
  decline: "decline",
};

/**
 * Config visual de cada FILTRO de la UI (sidebar).
 *
 * - `all` no tiene visual (es el estado "sin filtro")
 * - Los filtros por acción reutilizan ACTIVITY_VISUAL
 * - `unanswered` es un estado derivado (no una action), necesita su
 *   propio visual con icono de "pendiente"
 */
export const FILTER_VISUAL: Record<
  ActivityFilterType,
  ActivityVisualConfig | null
> = {
  all: null,
  confirm: ACTIVITY_VISUAL.confirm,
  view: ACTIVITY_VISUAL.view,
  decline: ACTIVITY_VISUAL.decline,
  unanswered: {
    label: () => "Sin responder",
    shortLabel: "Sin responder",
    icon: MailOpen, // mismo icono que "view" para coherencia visual
    iconBgClass: "bg-stone-100",
    iconColorClass: "text-stone-500",
    // Badge con tono amber para indicar "pendiente"
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    triggerActiveClass: "border-amber-300 bg-amber-50/70",
  },
};

/** Helper para obtener la config visual desde el filtro UI. */
export function getVisualForFilter(
  filter: ActivityFilterType,
): ActivityVisualConfig | null {
  return FILTER_VISUAL[filter];
}
