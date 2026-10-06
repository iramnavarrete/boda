import { getEventTypeName } from "@/utils/formatters";

/**
 * Subset de `Invitation` que necesita `openCalendarEvent`. Tiparlo
 * explícitamente (en vez de importar todo `Invitation`) evita acoplar
 * esta utilidad a cambios de tipos y permite reusarla en otros contextos
 * (ej. datos parciales en preview, mocks, tests).
 */
export interface CalendarEventInput {
  id: string;
  nombre: string;
  /** Tipo de evento (`boda`, `xv_anos`, `bautizo`, `cumpleanos`). */
  tipo: string;
  /** Fecha/hora de inicio del evento en formato ISO (`YYYY-MM-DDTHH:mm:ssZ`). */
  fechaISO: string;
  ceremonia?: {
    nombreTemplo?: string;
    enlaceMaps?: string;
  };
  recepcion?: {
    nombreSalon?: string;
    enlaceMaps?: string;
    direccion?: string;
  };
}

export type CalendarPlatform = "google" | "apple" | "outlook";

export interface OpenCalendarOptions {
  /** Duración del evento en horas (default 5). */
  durationHours?: number;
}

/** Evento "construido" listo para enviar al calendario. */
export interface BuiltCalendarEvent {
  titulo: string;
  descripcion: string;
  ubicacion: string;
  startDate: Date;
  endDate: Date;
  fechaInicioUTC: string;
  fechaFinUTC: string;
}

/**
 * Detecta el proveedor de calendario preferido según el User Agent.
 * SSR-safe: devuelve `"google"` cuando `navigator` no existe.
 */
export function detectCalendarPlatform(): CalendarPlatform {
  if (typeof navigator === "undefined") return "google";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|macintosh/.test(ua)) return "apple";
  if (/outlook/.test(ua)) return "outlook";
  return "google";
}

/**
 * Construye los strings (título/desc/ubicación) + fechas (UTC formateadas
 * para Google/Apple) a partir de los datos crudos del evento.
 *
 * Exportado para que sea testeable de forma aislada y para que, en el
 * futuro, pueda renderizarse un preview del evento antes de agregarlo.
 */
export function buildCalendarEvent(
  event: CalendarEventInput,
  options: OpenCalendarOptions = {},
): BuiltCalendarEvent {
  const durationHours = options.durationHours ?? 5;

  // 1. Título dinámico
  const eventType = getEventTypeName(event.tipo as never);
  const titulo = `${eventType} de ${event.nombre}`;

  // 2. Descripción dinámica
  let descripcion = `¡Te esperamos para celebrar este día tan especial!\n\n`;

  if (event.ceremonia?.nombreTemplo) {
    descripcion += `Ceremonia: ${event.ceremonia.nombreTemplo}\n${event.ceremonia.enlaceMaps || ""}\n\n`;
  }

  if (event.recepcion?.nombreSalon) {
    descripcion += `Recepción: ${event.recepcion.nombreSalon}\n${event.recepcion.enlaceMaps || ""}\n`;
  }

  // 3. Ubicación
  const ubicacion = event.recepcion?.nombreSalon
    ? `${event.recepcion.nombreSalon}, ${event.recepcion.direccion || ""}`
    : "Ubicación por confirmar";

  // 4. Fechas (la `fechaISO` ya incluye día + hora de recepción)
  const startDate = new Date(event.fechaISO);
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

  // Formato `YYYYMMDDTHHMMSSZ` requerido por Google Calendar y Apple iCal
  const formatICSDate = (date: Date) =>
    date.toISOString().replace(/-|:|\.\d+/g, "");

  return {
    titulo,
    descripcion,
    ubicacion,
    startDate,
    endDate,
    fechaInicioUTC: formatICSDate(startDate),
    fechaFinUTC: formatICSDate(endDate),
  };
}

/**
 * Abre el calendario preferido del usuario (Google / Apple iCal /
 * Outlook Live) con el evento prellenado.
 *
 * - Google / Outlook: `window.open` con la URL oficial de compose.
 * - Apple (iOS/macOS): descarga un `.ics` (mecanismo nativo en Safari).
 *
 * SSR-safe: no hace nada si `window` no existe.
 *
 * DRY: usada por `AddToCalendar` (bodas) y `xv-anos/CountDownBox`
 * (quinceañeras). Cualquier ajuste futuro (Outlook 365, ICS webcal://,
 * duración custom, etc.) se hace una sola vez aquí.
 */
export function openCalendarEvent(
  event: CalendarEventInput,
  options: OpenCalendarOptions = {},
): void {
  if (typeof window === "undefined") return;

  const platform = detectCalendarPlatform();
  const built = buildCalendarEvent(event, options);

  if (platform === "google") {
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      built.titulo,
    )}&details=${encodeURIComponent(
      built.descripcion,
    )}&location=${encodeURIComponent(
      built.ubicacion,
    )}&dates=${built.fechaInicioUTC}/${built.fechaFinUTC}`;
    window.open(url, "_blank");
    return;
  }

  if (platform === "outlook") {
    // Outlook Live soporta el formato ISO estándar con la `Z` al final
    const startDt = built.startDate.toISOString().split(".")[0] + "Z";
    const endDt = built.endDate.toISOString().split(".")[0] + "Z";

    const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
      built.titulo,
    )}&body=${encodeURIComponent(
      built.descripcion,
    )}&location=${encodeURIComponent(
      built.ubicacion,
    )}&startdt=${startDt}&enddt=${endDt}`;
    window.open(url, "_blank");
    return;
  }

  if (platform === "apple") {
    const uid = `evento-${event.id}-${Date.now()}@jninvitaciones.com`;

    // Saltos de línea normales → `\n` literales requeridos por .ics
    const contenidoICS = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//boda//jninvitaciones.com//ES
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${built.fechaInicioUTC}
DTSTART:${built.fechaInicioUTC}
DTEND:${built.fechaFinUTC}
SUMMARY:${built.titulo}
DESCRIPTION:${built.descripcion.replace(/\n/g, "\\n")}
LOCATION:${built.ubicacion}
END:VEVENT
END:VCALENDAR`.trim();

    const blob = new Blob([contenidoICS], {
      type: "text/calendar;charset=utf-8",
    });
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(blob);
    enlace.download = `${event.id}.ics`;
    enlace.click();
    return;
  }
}